import { Component, Input, OnInit } from '@angular/core';
import { difference } from 'lodash';
import { TableDataService } from '../data/table-data.service';
import { romanize } from '../data/table-data.utils';
import { NgTableState } from '../ng-table-state.service';

@Component({
  selector: 'tr[table-row]',
  templateUrl: './table-row.component.html',
  styleUrls: ['./table-row.component.scss']
})
export class TableRowComponent implements OnInit {

  @Input() isEditing: boolean;

  @Input() row;
  @Input() rowIndex;
  @Input() groupIndex;
  @Input() group;
  @Input() parentIndex;
  @Input() parentText;

  public readonly words = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  constructor (private _dataService: TableDataService,
               public state: NgTableState,
  ) {}

  ngOnInit () {
  }

  get configs () {
    return this.state.configurations;
  }

  get data () {
    return this.state.data;
  }

  trackByIndex (index) {
    return index;
  }

  getRowIndex(currentIndex, parent: any = {}) {
    const indexConfigs = this.state.configurations.states.index;
    const paging = this.state.configurations.states.paging;

    const index = paging.enabled ? (paging.pageNumber - 1) * paging.pageSize + currentIndex : currentIndex;

    if (indexConfigs.rowIndexPattern) {
      return indexConfigs.rowIndexPattern(index, parent);
    }

    if (indexConfigs.rowIndexType === 'romanNumeral') {
      return romanize(index);
    }

    return index + 1;
  }

  onActionClicked (index, actionType, rowIndex, group) {
    if (!this.configs.states.actions[index].clicked) {
      return;
    }

    this.configs.states.actions[index].clicked({
      type: actionType,
      row: this._dataService.getRow(rowIndex, group),
      rowIndex: rowIndex,
      tableData: this.data,
      ...group ? { group } : {},
    });
  }

  getActions(index, rowIndex, group?) {
    const actionConfigs = this.configs.states.actions[index];
    const actionsOnRow = actionConfigs.actionsOnRow;
    const hiddenActions = this.configs.hiddenActions.get(actionConfigs) || [];

    if (actionsOnRow && typeof actionsOnRow === 'function') {
      const rowData = this._dataService.getRow(rowIndex, group);
      const actions = actionsOnRow({
        row: rowData,
        types: actionConfigs.types,
      });

      return difference(actions, hiddenActions);
    }

    // TODO: implement this
    return difference(actionConfigs.static, hiddenActions);
  }

}
