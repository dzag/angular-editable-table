import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TableConfigurations } from './core/table-configurations';
import { TableData } from './core/data/table-data';
import { TableDataService } from './core/data/table-data.service';
import { CellManager } from './core/table-cell/cell-manager.service';
import { CellService } from './core/table-cell/cell.service';
import { KeyValue } from '@angular/common';
import { romanize } from './core/data/table-data.utils';

@Component({
  selector: 'ng-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  providers: [
    CellService,
    CellManager,
    {
      provide: TableDataService,
      useClass: TableDataService,
      deps: [CellManager, ChangeDetectorRef]
    }
  ]
})
export class TableComponent implements OnInit, OnDestroy {

  @Input() configurations: TableConfigurations;
  @Input() data: any[];
  @Input() groupData: any[];

  public readonly words = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  public tableData: TableData;

  constructor (private detectorRef: ChangeDetectorRef,
               private _dataService: TableDataService,
               private _cellService: CellService,
               private cellManager: CellManager,
  ) {}

  ngOnInit () {
    this.patchConfigs();

    this.tableData = new TableData(this.configurations, this.data);
    this._dataService.tableData = this.tableData;
  }

  ngOnDestroy (): void {}

  trackByIndex (index) {
    return index;
  }

  keyDescOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return a.key > b.key ? -1 : (b.key > a.key ? 1 : 0);
  };

  getRowIndex(currentIndex, parent: any = {}) {
    const indexConfigs = this.configurations.states.index;

    if (indexConfigs && indexConfigs.rowIndexPattern ) {
      return indexConfigs.rowIndexPattern(currentIndex, parent);
    }

    if (indexConfigs && indexConfigs.rowIndexType === 'romanNumeral') {
      return romanize(currentIndex);
    }

    return currentIndex + 1;
  }

  getActions(rowIndex, group?) {
    const actionConfigs = this.configurations.states.actions;

    if (actionConfigs.actionsOnRow) {
      const rowData = this._dataService.getRow(rowIndex, group);
      return actionConfigs.actionsOnRow(rowData, actionConfigs.types);
    }

    // TODO: implement this
    return [];
  }

  get configs() {
    return this.configurations.states;
  }

  get showIndex() {
    return this.configurations.states.index.show;
  }

  get showActions() {
    return this.configurations.states.actions.show;
  }

  get actionsHeader() {
    return this.configurations.states.actions.name || '';
  }

  get actionTypes() {
    const actionConfigs = this.configurations.states.actions;

    if (!actionConfigs.types) {
      return [];
    }

    return actionConfigs.types;
  }

  private patchConfigs () {
    const configs: any = this.configurations;
    configs.cd = this.detectorRef;
  }

  onActionClicked (actionType, rowIndex, group) {
    this.configs.actions.clicked({
      type: actionType,
      row: this._dataService.getRow(rowIndex, group),
    });
  }
}
