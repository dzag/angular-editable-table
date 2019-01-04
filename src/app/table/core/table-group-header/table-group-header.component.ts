import { ChangeDetectorRef, Component, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { TableRowGroupActionsConfiguration, TableRowGroupsConfiguration } from '@app/table';
import { CellData } from '@app/table/core/data/table-data-internal';
import { TableDataService } from '@app/table/core/data/table-data.service';
import { NgTableState } from '@app/table/core/ng-table-state.service';

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

  private _ownData;

  constructor (private _dataService: TableDataService,
               private _cd: ChangeDetectorRef,
               private _state: NgTableState,
  ) {
  }

  ngOnInit () {
    this.columns = this.getGroupColumns(this.group.configs);
    // this._ownData = this.getCellDataAndOriginals().data;

    // this.setSummaryCell(1);

    // this._dataService.allChanges().subscribe((res) => {
    //   if (res.col === 1) {
    //     this.setSummaryCell(1);
    //     this._cd.detectChanges();
    //   }
    // });

  }

  @HostBinding('class')
  get hostClass() {
    return `group-level-${this.group.groupIndex + 1}`;
  }

  get configs() {
    return this._state.configurations;
  }

  getGroupColumns (groupConfigs: TableRowGroupsConfiguration) {
    let totalLength = this.configs.states.columns.length + this.configs.states.actions.length;
    totalLength = groupConfigs.namespan > totalLength ? totalLength : totalLength - groupConfigs.namespan + 1;

    const array = Array(totalLength).fill(undefined).map(() => ({
      value: '',
      type: '',
      colspan: 1,
    }) as any);

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

  getCellDataAndOriginals(): { data: CellData[][], original: any[] } {
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
      data,
      original: originalData,
    };
  }

  getFirstRowOfChildrenData() {
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
  onClick() {
    console.log('this', this);
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

  private setSummaryCell (index) {
    const data = this._ownData.map(x => x[index]).map(x => x.value).reduce((x1, x2) => x1 + x2, 0);
    this.columns[index] = {
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
