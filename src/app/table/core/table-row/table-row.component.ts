import { Component, Input, OnInit } from '@angular/core';
import { TableConfigs, TableData } from '@app/table';
import { romanize } from '../data/table-data.utils';
import { TableDataService } from '../data/table-data.service';
import { TableConfigurations } from '../table-configurations';
import { difference } from 'lodash';

@Component({
  selector: 'tr[table-row]',
  templateUrl: './table-row.component.html',
  styleUrls: ['./table-row.component.scss']
})
export class TableRowComponent implements OnInit {

  @Input() configs: TableConfigurations;
  @Input() data: TableData;
  @Input() isEditing: boolean;

  @Input() row;
  @Input() rowIndex;
  @Input() groupIndex;
  @Input() group;
  @Input() parentIndex;
  @Input() parentText;

  @Input() showIndex;
  @Input() showActions: boolean;

  public readonly words = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  constructor (private _dataService: TableDataService) { }

  ngOnInit () {
  }

  trackByIndex (index) {
    return index;
  }

  getRowIndex(currentIndex, parent: any = {}) {
    const indexConfigs = this.configs.states.index;

    if (indexConfigs.rowIndexPattern) {
      return indexConfigs.rowIndexPattern(currentIndex, parent);
    }

    if (indexConfigs.rowIndexType === 'romanNumeral') {
      return romanize(currentIndex);
    }

    return currentIndex + 1;
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
