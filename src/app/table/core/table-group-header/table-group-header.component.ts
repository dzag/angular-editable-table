import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { TableRowGroupActionsConfiguration, TableRowGroupsConfiguration } from '@app/table';

@Component({
  selector: 'tr[table-group-header]',
  templateUrl: './table-group-header.component.html',
  styleUrls: ['./table-group-header.component.scss']
})
export class TableGroupHeaderComponent implements OnInit {

  @HostBinding('class') hostClass = '';

  @Input() group;
  @Input() groupIndex;
  @Input() parentIndex;
  @Input() parentText;

  constructor () { }

  ngOnInit () {
    this.hostClass = `group-level-${this.group.groupIndex + 1}`;
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
