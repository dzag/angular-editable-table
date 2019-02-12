import { ChangeDetectorRef, Injectable } from '@angular/core';
import { TableDataInternal } from './table-data-internal';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import * as math from 'mathjs';
import { merge, pick } from 'lodash';
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

const defaultValueSetterOptions: any = {
  detect: true,
  emitEvent: true,
};

const getColumnFromSymbol = (symbol: string) => parseInt(symbol.substr(1), 10);

let id = 0;

@Injectable()
export class TableDataService {
  public tableDataInternal: TableDataInternal;

  private _formulaParser: FormulaParser;

  private _changes$ = new Subject<any>();
  private _changesObs = this._changes$.asObservable();

  private _cellService: CellService;

  private _configurations: TableConfigurations;

  constructor (private _cellManager: CellManager,
               private _cd: ChangeDetectorRef,
  ) {}

  setTableData (configurations: TableConfigurations, value: TableData) {
    this.tableDataInternal = new TableDataInternal(configurations, value);
    this._configurations = configurations;
    if (configurations.states.formulas) {
      this._formulaParser = new FormulaParser(configurations.states);
      defaultValueSetterOptions.formulaCheck = true;
    }
  }

  setValue (row, col, group, value, options?: ValueSetterOptions, ignores = []) {
    options = merge({...defaultValueSetterOptions}, options);
    const prevValue = this.tableDataInternal.getCell(row, col, group).value;
    this.tableDataInternal.setCell(row, col, group, {value});

    if (options.formulaCheck) {
      const prop = this._configurations.states.columns[col].prop;
      const expresionTrees = this._configurations.states.formulas.all
        .map(e => e.expression)
        .map(e => math.parse(e));

      for (const parsedTree of expresionTrees) {
        const symbolNodes = getSymbolNodes(parsedTree.value).map(n => n.name);

        const compiled = parsedTree.value.compile();
        const leftNode = parsedTree['object'].name;
        const leftCol = this._configurations.states.columns.findIndex(c => c.prop === leftNode);

        const rowData = this.tableDataInternal.getRow(row, group);

        const otherSymbolNames = symbolNodes.filter(name => !name.includes(prop));

        const scope = pick(rowData, otherSymbolNames);
        scope[prop] = value;

        Object.keys(scope).forEach(k => scope[k] = scope[k] || 0);

        const newValue = compiled.eval(scope);
        const oldValue = this.tableDataInternal.getCellValue(row, leftCol, group);
        this.tableDataInternal.setCellValue(row, leftCol, group, newValue);
        this._changes$.next({ row, col: leftCol, group, value: newValue, prevValue: oldValue });
      }
    }

    if (options.detect) {
      // TODO: fix cell manager
      // this._cellManager.detectChanges({row, column: col});
      this._cd.detectChanges();
    }

    if (options.emitEvent) {
      this._changes$.next({row, col, group, value, prevValue});
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

  allChanges() {
    return this._changesObs;
  }

  addRow(data: any | any[]) {
    const canGeneratedId = this._configurations.states.editing.generateIdentifier;
    const idKey = this._configurations.states.rowIdentifier;

    data = Array.isArray(data) ? data : [data];
    data = data.map(d => ({
      ...d,
      ...canGeneratedId ? { [idKey]: `#${++id}` } : {},
      __generated: true
    }));

    this.tableDataInternal.addRow(this._configurations.states.columns, data);
    this._cd.markForCheck();
  }

}

function getSymbolNodes (tree) {
  const nodes = [];
  tree.traverse(node => {
    if (node.isSymbolNode) {
      nodes.push(node);
    }
  });
  return nodes;
}
