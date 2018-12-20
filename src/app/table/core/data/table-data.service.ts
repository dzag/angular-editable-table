import { ChangeDetectorRef, Injectable } from '@angular/core';
import { TableDataInternal } from './table-data-internal';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import * as math from 'mathjs';
import { merge } from 'lodash';
import { CellManager } from '../table-cell/cell-manager.service';
import { FormulaParser } from '../formula/formula-parser';
import { CellService } from '../table-cell/cell.service';
import { TableData } from '../table-data';
import { TableConfigurations } from '../table-configurations';

interface ValueSetterOptions {
  detect?: boolean;
  emitEvent?: boolean;
  formulaCheck?: boolean;
}

const defaultValueSetterOptions = {
  detect: true,
  emitEvent: true,
  formulaCheck: false,
};

const getColumnFromSymbol = (symbol: string) => parseInt(symbol.substr(1), 10);

@Injectable()
export class TableDataService {
  public tableDataInternal: TableDataInternal;

  private _formulaParser: FormulaParser;

  private _changes$ = new Subject<any>();
  private _changesObs = this._changes$.asObservable();

  private _cellService: CellService;

  constructor (private _cellManager: CellManager,
               private _cd: ChangeDetectorRef,
  ) {}

  set formulaParser (value: FormulaParser) {
    this._formulaParser = value;
  }

  setTableData (configurations: TableConfigurations, value: TableData) {
    this.tableDataInternal = new TableDataInternal(configurations, value);
  }

  setValue (row, col, group, value, options?: ValueSetterOptions) {
    options = merge({...defaultValueSetterOptions}, options);
    const prevValue = this.tableDataInternal.getCell(row, col, group).value;
    this.tableDataInternal.setCell(row, col, group, {value});

    if (options.detect) {
      // TODO: fix cell manager
      // this._cellManager.detectChanges({row, column: col});
    }

    if (options.emitEvent) {
      this._changes$.next({row, col, group, value, prevValue});
    }

    if (options.formulaCheck) {
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
    return this.tableDataInternal.getCellValue(row, col, group);
  }

  getRow (row, group?) {
    return this.tableDataInternal.getRow(row, group);
  }

  deleteRow (row, group?) {
    this._cellService.setActive(null);
    this.tableDataInternal.deleteRow(row, group);
    this._cd.detectChanges();
  }

  getCell (row, col, group?) {
    return this.tableDataInternal.getCell(row, col, group);
  }

  changes (row, col, group) {
    return this._changesObs.pipe(
      filter(({row: changedRow, col: changedCol, group: changedGroup}) =>
        changedRow === row && changedCol === col && (group ? changedGroup === group : true)),
      map(({value, prevValue}) => ({value, old: prevValue}))
    );
  }

}
