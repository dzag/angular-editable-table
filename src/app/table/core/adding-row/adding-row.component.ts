import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AddingDataService } from '../table-cell-for-adding/adding-data.service';
import { TableCellForAddingComponent } from '../table-cell-for-adding/table-cell-for-adding.component';
import { AddingCellService } from '../table-cell-for-adding/adding-cell.service';
import { TableDataService } from '../data/table-data.service';
import { TableConfigs } from '../table.models';
import { TableData } from '../table-data';
import { cloneDeep } from 'lodash';

@Component({
  selector: '[adding-row]',
  templateUrl: './adding-row.component.html',
  styleUrls: ['./adding-row.component.scss'],
  providers: [
    AddingDataService,
  ]
})
export class AddingRowComponent implements OnInit {
  @Input() configs: TableConfigs;

  @Input()
  set data (value: TableData) {
    this._data = value;
    if (this.configs.editing && this.configs.editing.allowAdding) {
      this.createRow(value);
    }
  }

  activeCell: TableCellForAddingComponent | null;

  private _data: TableData;

  constructor (private _addingDataService: AddingDataService,
               private _addingCellService: AddingCellService,
               private _tableDataService: TableDataService,
               private _cd: ChangeDetectorRef,
  ) {
    this._addingCellService.activeCell.subscribe(cell => {
      this.activeCell = cell;
      this._cd.markForCheck();
    });
  }

  ngOnInit () {
  }

  trackByIndex (index) {
    return index;
  }

  isActiveCell(cell: any) {
    return this.activeCell === cell;
  }

  onAddClick (event) {
    this._tableDataService.addRow(this._addingDataService.addingRowData);
    this.createRow(this._data);
  }

  private createRow (value: TableData) {
    const addingRow = this.configs.columns.reduce((prev, current) => {
      prev[current.prop] = '';
      return prev;
    }, {
      ...value.initialData[0] || {},
    });
    delete addingRow[this.configs['rowIdentifier']];
    this._addingDataService.addingRowData = addingRow;
  }
}
