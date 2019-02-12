import { ChangeDetectorRef, Component, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { TableRowGroupActionsConfiguration, TableRowGroupsConfiguration } from '../table.models';
import { CellData } from '../data/table-data-internal';
import { TableDataService } from '../data/table-data.service';
import { NgTableState } from '../ng-table-state.service';
import { CellService } from '../table-cell/cell.service';
import { isPlainObject } from 'lodash';
import { from, isObservable, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'tr[table-group-header]',
  templateUrl: './table-group-header.component.html',
  styleUrls: ['./table-group-header.component.scss']
})
export class TableGroupHeaderComponent implements OnInit {

  @Input() group;
  @Input() groupIndex;
  @Input() parentIndex;
  @Input() parentText;

  public columns;

  private _firstRow;

  private _cells;

  private _fns = {};

  constructor (private _dataService: TableDataService,
               private _cd: ChangeDetectorRef,
               private _cellService: CellService,
               private _state: NgTableState,
  ) {
  }

  ngOnInit () {
    this._firstRow = this.getFirstRowOfGroup(this.group);
    const { cells, originals } = this.getCellsAndOriginals();
    this._cells = cells;

    if (this.isGroupHeaderOfSubGroups) {
      this.columns = this.getGroupColumns(this.group.configs);
    } else if (this.isGroupHeaderOfData) {
      const configs: TableRowGroupsConfiguration = this.group.configs;
      const sums = this.group.configs.summaries;
      const cols = this.emptyArrays(this.group.configs);
      Object.entries(sums).forEach(([colIndex, value]: [string | number, string | Function | Observable<any> | object]) => {
        const cellValues: any[] = cells.map(c => c[colIndex]).map(c => c.value);

        const prop = this.configs.states.columns[colIndex].prop;
        const cellOriginalValues: any[] = originals.map(o => o[prop]);

        if (typeof value === 'string') {
          if (value.startsWith('$')) {
            if (value === '$name') {
              cols[colIndex] = {
                value: configs.name(this._firstRow),
                type: '',
                colspan: 1,
              };
            }
          } else if (value.startsWith('::')) {
            if (['::Sum', '::Total'].includes(value)) {
              this._fns[colIndex] = () => {
                cols[colIndex] = this.getSumaryCell(colIndex, cells);
              };
            } else if (value === '::Min') {
              this._fns[colIndex] = () => {
                cols[colIndex] = {
                  value: Math.min.apply(null, cellValues),
                  type: 'number',
                  colspan: 1,
                };
              };
            } else if (value === '::Max') {
              this._fns[colIndex] = () => {
                cols[colIndex] = {
                  value: Math.max.apply(null, cellValues),
                  type: 'number',
                  colspan: 1,
                };
              };
            }

            this._fns[colIndex]();
          }
        } else if (isPlainObject(value)) {

        } else if (isObservable(value)) {

        } else if (typeof value === 'function') {
          const observableOrValue = value({ rows: this.group.originalData, cells: cellOriginalValues });
          const source = isObservable(observableOrValue) ? observableOrValue : from(Promise.resolve(observableOrValue));
          source.pipe(take(1)).subscribe(v => {
            cols[colIndex] = {
              value: v || '',
              type: '',
              colspan: 1,
            };
            this._cd.detectChanges();
          });
        }
      });

      this.columns = cols;
    }
    // this._ownData = this.getCellDataAndOriginals().data;

    // this.setSummaryCell(1);

    this._dataService.allChanges().subscribe((res) => {
      const fn = this._fns[res.col];
      if (fn) {
        fn();
        this._cd.detectChanges();
      }
    });

  }

  @HostBinding('class')
  get hostClass () {
    return `group-level-${this.group.groupIndex + 1}`;
  }

  get configs () {
    return this._state.configurations;
  }

  getGroupColumns (groupConfigs: TableRowGroupsConfiguration) {
    const array = this.emptyArrays(groupConfigs);

    const firstRow = this.getFirstRowOfChildrenData();

    const nameAtIndex = 0;
    array[nameAtIndex].value = groupConfigs.name(firstRow);
    array[nameAtIndex].type = 'name';
    array[nameAtIndex].colspan = !groupConfigs.summaries ? groupConfigs.namespan : 1;

    const actions = groupConfigs.actions;
    if (actions) {
      for (let i = this.configs.states.columns.length - groupConfigs.namespan + 1, j = 0; i < array.length; i++, j++) {
        if (actions[j]) {
          array[i].value = actions[j];
          array[i].type = 'actions';
        }
      }
    }

    return array;
  }

  private emptyArrays (groupConfigs: TableRowGroupsConfiguration) {
    let totalLength = this.configs.states.columns.length + this.configs.states.actions.length;
    totalLength = groupConfigs.namespan > totalLength ? totalLength : totalLength - groupConfigs.namespan + 1;

    const array = Array(totalLength).fill(undefined).map(() => ({
      value: '',
      type: '',
      colspan: 1,
    }) as any);
    return array;
  }

  getCellsAndOriginals (): { cells: CellData[][], originals: any[] } {
    const data = [];
    const originalData = [];
    const fn = (_group) => {
      if (_group.data) {
        data.push(..._group.data);
        originalData.push(..._group.originalData);
      }
      if (_group.subGroups) {
        _group.subGroups.forEach(s => fn(s));
      }
    };
    fn(this.group);
    return {
      cells: data,
      originals: originalData,
    };
  }

  getFirstRowOfChildrenData () {
    let data;
    const fn = (_group) => {
      if (_group.data) {
        data = _group.originalData[0];
      }
      if (_group.subGroups) {
        for (const s of _group.subGroups) {
          fn(s);
        }
      }
    };
    fn(this.group);
    return data;
  }

  @HostListener('click')
  onClick () {
    this._cellService.setActive(null);
  }

  trackByIndex (index) {
    return index;
  }

  onGroupActionClicked (action: string, actionConfigs: TableRowGroupActionsConfiguration, group) {
    const groupConfigs: TableRowGroupsConfiguration = group.configs;
    if (groupConfigs.actions && actionConfigs.clicked) {
      const firstRowData = this.getFirstRowOfGroup(group);
      actionConfigs.clicked({
        type: action,
        groupBy: groupConfigs.groupBy,
        firstRow: firstRowData,
      });
    }
  }

  private get isGroupHeaderOfData () {
    return !!this.group.data;
  }

  private get isGroupHeaderOfSubGroups () {
    return !!this.group.subGroups;
  }

  private getSumaryCell (index, cells) {
    const data = cells.map(x => x[index]).map(x => x.value).reduce((x1, x2) => x1 + x2, 0);
    return {
      value: data,
      type: 'number',
      colspan: 1,
    };
  }

  private getFirstRowOfGroup (group) {
    if (group.data) {
      return group.originalData[0];
    }

    if (group.subGroups.length === 0) {
      return [];
    }

    return this.getFirstRowOfGroup(group.subGroups[0]);
  }

}
