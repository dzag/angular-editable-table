import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Input,
  NgZone,
  OnDestroy,
  OnInit
} from '@angular/core';
import { TableConfigurations } from './core/table-configurations';
import { TableDataService } from './core/data/table-data.service';
import { CellManager } from './core/table-cell/cell-manager.service';
import { CellService } from './core/table-cell/cell.service';
import { romanize } from './core/data/table-data.utils';
import { TableData } from './core/table-data';
import { difference } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { FormMode } from 'src/app/core/interfaces/app/form-mode';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { distinctUntilChanged, pluck } from 'rxjs/operators';
import { TableRowGroupActionsConfiguration, TableRowGroupsConfiguration } from './core/table.models';
import { CellData } from './core/data/table-data-internal';
import { AddingCellService } from './core/table-cell-for-adding/adding-cell.service';
import { AddingDataService } from './core/table-cell-for-adding/adding-data.service';

@Component({
  selector: 'ng-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ng-table.component.html',
  styleUrls: ['./ng-table.component.scss'],
  providers: [
    CellService,
    CellManager,
    AddingCellService,
    AddingDataService,
    {
      provide: TableDataService,
      useClass: TableDataService,
      deps: [CellManager, ChangeDetectorRef]
    }
  ]
})
export class NgTableComponent implements OnInit, OnDestroy, AfterViewInit {
  @HostBinding('class') hostClass = 'ng-table';

  @Input() class = 'table-responsive';
  @Input() configurations: TableConfigurations;

  @Input()
  get data (): TableData {
    return this._data;
  }

  set data (value: TableData) {
    this._data = value || new TableData();
    this.patchTableData(this._data);
    this._dataService.setTableData(this.configurations, this._data);
  }

  public readonly words = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  public isEditing = false;

  private _data: TableData;

  constructor (private _cd: ChangeDetectorRef,
               private _dataService: TableDataService,
               private _elementRef: ElementRef,
               private _cellService: CellService,
               private _addingCellService: AddingCellService,
               private _addingDataService: AddingDataService,
               private _ngZone: NgZone,
               private _route: ActivatedRoute,
  ) {}

  ngOnInit () {
    this.isEditing = this.configs.editing.enabled;

    this.patchConfigs();
    this.deActiveCellOnClickedOutside();
    this.watchFormModeChanges();
  }

  ngOnDestroy (): void {
    this._ngZone.runOutsideAngular(() => {
      document.removeEventListener('click', this.deActiveCellOnClickedOutside['listener']);
      document.removeEventListener('click', this.deActiveAddingCellOnClickedOutside['listener']);
    });
  }

  ngAfterViewInit (): void {
    this.subscribeToAddingCellEvents();
  }

  trackByIndex (index) {
    return index;
  }

  getRowIndex(currentIndex, parent: any = {}) {
    const indexConfigs = this.configurations.states.index;

    if (indexConfigs.rowIndexPattern) {
      return indexConfigs.rowIndexPattern(currentIndex, parent);
    }

    if (indexConfigs.rowIndexType === 'romanNumeral') {
      return romanize(currentIndex);
    }

    return currentIndex + 1;
  }

  getActions(index, rowIndex, group?) {
    const actionConfigs = this.configurations.states.actions[index];
    const actionsOnRow = actionConfigs.actionsOnRow;
    const hiddenActions = this.configurations.hiddenActions.get(actionConfigs) || [];

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

  onActionClicked (index, actionType, rowIndex, group) {
    if (!this.configs.actions[index].clicked) {
      return;
    }

    this.configs.actions[index].clicked({
      type: actionType,
      row: this._dataService.getRow(rowIndex, group),
      rowIndex: rowIndex,
      tableData: this.data,
      ...group ? { group } : {},
    });
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

  couldRenderRow (row: CellData[]) {
    for (let i = 0; i < row.length; i++) {
      const data = row[i].value;
      const config = this.configs.columns[i];

      if (Object.prototype.hasOwnProperty.call(config, ['hideRowOn'])) {
        let dataToCompare;
        if (typeof config.hideRowOn === 'function') {
          return !config.hideRowOn(data);
        } else {
          dataToCompare = config.hideRowOn;
        }

        if (data === dataToCompare) {
          return false;
        }
      }
    }

    return true;
  }

  onPageChanged (page: any) {
    if (!this.configs.paging.enabled) {
      return;
    }

    this.configs.paging.pageNumber = page.pageNumber;
    this.configs.paging.pageSize = page.pageSize;

    this.configs.paging.onPageChanged(page);
  }

  onTotalRecordsChanged (totalRecords: number) {
    if (!this.configs.paging.enabled) {
      return;
    }

    this.configs.paging.totalRecords = totalRecords;
  }

  get tableDataInternal() {
    return this._dataService.tableDataInternal;
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

  get actions() {
    if (!this.showActions) {
      return [];
    }

    return this.configs.actions || [];
  }

  private deActiveCellOnClickedOutside() {
    const eventListener = this.deActiveCellOnClickedOutside['listener'] = event => {
      const $tableBodies: HTMLElement[] = Array.from(this._elementRef.nativeElement.querySelectorAll('.ng-table-body'));
      if ($tableBodies && !$tableBodies.some(e => e.contains(event.target))) {
        // this._cellService.setActive(null);
        // this._addingCellService.setActive(null);
      }
    };

    this._ngZone.runOutsideAngular(() => document.addEventListener('click', eventListener));
  }

  private deActiveAddingCellOnClickedOutside() {
    Promise.resolve().then(() => {
      let $addingRow: null | HTMLElement;
      const eventListener = this.deActiveAddingCellOnClickedOutside['listener'] = event => {
        $addingRow = $addingRow || this._elementRef.nativeElement.querySelector('.ng-table-adding-row');
        if ($addingRow && !$addingRow.contains(event.target)) {
          // this._addingCellService.setActive(null);
        }
      };

      this._ngZone.runOutsideAngular(() => document.addEventListener('click', eventListener));
    });
  }

  private subscribeToAddingCellEvents () {
    if (this.deActiveAddingCellOnClickedOutside['listener']) {
      this._ngZone.runOutsideAngular(() => {
        document.removeEventListener('click', this.deActiveAddingCellOnClickedOutside['listener']);
      });
    }

    if (this.configs.editing.enabled && this.configs.editing.allowAdding && this.isEditing) {
      this.deActiveAddingCellOnClickedOutside();
    }
  }

  private watchFormModeChanges() {
    if (!this._route.parent || !this._route.parent.snapshot.params.mode) {
      return;
    }

    this._route.parent.params.pipe(
      untilDestroyed(this),
      pluck<any, string>('mode'),
      distinctUntilChanged()
    ).subscribe(mode => {
      this.isEditing = mode === FormMode.Edit;
      if (mode === FormMode.Edit) {
        this.subscribeToAddingCellEvents();
      }
    });
  }

  private patchConfigs () {
    const configs: any = this.configurations;
    configs['_cd'] = this._cd;
  }

  private patchTableData(data: TableData) {
    data['_dataService'] = this._dataService;
    data['_configs'] = this.configurations;
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
