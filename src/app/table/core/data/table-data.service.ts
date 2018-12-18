import { ChangeDetectorRef, Injectable } from '@angular/core';
import { TableDataInternal } from './table-data-internal';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import * as math from 'mathjs';
import { merge } from 'lodash';
import { CellManager } from '../table-cell/cell-manager.service';
import { FormulaParser } from '../formula/formula-parser';

interface ValueSetterOptions {
  detect?: boolean;
  emitEvent?: boolean;
  formulaCheck?: boolean;
}

const defaultValueSetterOptions = {
  detect: true,
  emitEvent: true,
  formulaCheck: true,
};

const getColumnFromSymbol = (symbol: string) => parseInt(symbol.substr(1), 10);

@Injectable()
export class TableDataService {
  private _tableData: TableDataInternal;
  private _formulaParser: FormulaParser;

  private _changes$ = new Subject<any>();
  private _changesObs = this._changes$.asObservable();

  constructor (private _cellManager: CellManager,
               private _cd: ChangeDetectorRef,
  ) {}

  get tableDataInternal (): TableDataInternal {
    return this._tableData;
  }

  set tableDataInternal (value: TableDataInternal) {
    this._tableData = value;
  }

  set formulaParser (value: FormulaParser) {
    this._formulaParser = value;
  }

  setValue (row, col, group, value, options?: ValueSetterOptions) {
    options = merge({...defaultValueSetterOptions}, options);
    const prevValue = this._tableData.getCell(row, col, group).value;
    this._tableData.setCell(row, col, group, {value});

    if (options.detect) {
      this._cellManager.detectChanges({row, column: col});
    }

    if (options.emitEvent) {
      this._changes$.next({row, col, group, value, prevValue});
    }

    if (options.formulaCheck) {
      console.log('check!');
      const formula = this._formulaParser.getFormulaForColumn(col);
      if (formula) {
        const [resultSymbol, expression] = formula.split('=');
        const replacers = this._formulaParser.getReplacersForFormula(formula).filter(r => {
          const column = this._formulaParser.symbolMap[r].substr(1);
          return col !== (+column) || r !== resultSymbol;
        });
        this._cellManager.getCellsInRow(row).subscribe(cells => {
          const resultCell = cells.find(cell => cell.column === getColumnFromSymbol(resultSymbol));
          const scope = merge({}, ...cells.filter(cell => replacers.includes(cell.prop)).map(cell => ({
            ['x' + cell.column]: cell.data || 0
          })));
          const resultValue = math.eval(expression, scope);
          this.setValue(resultCell.row, resultCell.column, resultValue, {
            formulaCheck: false,
          });
        });
      }
    }
  }

  getValue (row, col, group?) {
    return this._tableData.getCellValue(row, col, group);
  }

  getRow (row, group?) {
    return this.tableDataInternal.getRow(row, group);
  }

  deleteRow (row, group?) {
    this.tableDataInternal.deleteRow(row, group);
    this._cd.detectChanges();
  }

  getCell (row, col, group?) {
    return this._tableData.getCell(row, col, group);
  }

  changes (row, col, group) {
    return this._changesObs.pipe(
      filter(({row: changedRow, col: changedCol, group: changedGroup}) =>
        changedRow === row && changedCol === col && (group ? changedGroup === group : true)),
      map(({value, prevValue}) => ({value, old: prevValue}))
    );
  }

}
