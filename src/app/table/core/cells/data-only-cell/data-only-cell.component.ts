import { Component, Input, OnInit } from '@angular/core';
import { TableColumnConfigurations } from '../../table.models';
import { CellData } from '../../data/table-data-internal';

@Component({
  selector: 'data-only-cell',
  templateUrl: './data-only-cell.component.html',
  styleUrls: ['./data-only-cell.component.scss']
})
export class DataOnlyCellComponent implements OnInit {

  @Input() columnConfigs: TableColumnConfigurations;
  @Input() cellData: CellData;

  constructor () { }

  ngOnInit () {
  }

  get data() {
    return this.cellData.value;
  }

}
