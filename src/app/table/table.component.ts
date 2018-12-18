import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TableConfigurations } from './core/table-configurations';
import { TableDataInternal } from './core/data/table-data-internal';
import { TableDataService } from './core/data/table-data.service';
import { CellManager } from './core/table-cell/cell-manager.service';
import { CellService } from './core/table-cell/cell.service';
import { KeyValue } from '@angular/common';
import { romanize } from './core/data/table-data.utils';
import { TableData } from './core/table-data';

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
  @Input() data: TableData;
  @Input() groupData: any[];

  public readonly words = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  public tableDataInternal: TableDataInternal;

  constructor (private _cd: ChangeDetectorRef,
               private _dataService: TableDataService,
               private _cellService: CellService,
               private cellManager: CellManager,
  ) {}

  ngOnInit () {
    this.patchConfigs();
    this.data['_dataService'] = this._dataService;

    this.tableDataInternal = new TableDataInternal(this.configurations, this.data);
    this._dataService.tableDataInternal = this.tableDataInternal;
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

  getActions(index, rowIndex, group?) {
    const actionConfigs = this.configurations.states.actions[index];

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
    return this.configurations.states.actions.length > 0;
  }

  get actionsHeader() {
    if (!this.showActions) {
      return [];
    }

    return this.configurations.states.actions.map(a => a.name);
  }

  get groupColumns() {
    const totalLength = this.configs.columns.length + this.configs.actions.length;
    return Array(totalLength).fill(null);
  }

  private patchConfigs () {
    const configs: any = this.configurations;
    configs.cd = this._cd;
  }

  onActionClicked (index, actionType, rowIndex, group) {
    this.configs.actions[index].clicked({
      type: actionType,
      row: this._dataService.getRow(rowIndex, group),
      rowIndex: rowIndex,
      group,
    });
  }
}
