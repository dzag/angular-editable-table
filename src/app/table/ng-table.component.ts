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
import { TableData } from './core/table-data';
import { ActivatedRoute } from '@angular/router';
import { FormMode } from '@app/core/interfaces/app/form-mode';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { distinctUntilChanged, pluck } from 'rxjs/operators';
import { CellData } from './core/data/table-data-internal';
import { AddingCellService } from './core/table-cell-for-adding/adding-cell.service';
import { AddingDataService } from './core/table-cell-for-adding/adding-data.service';
import { NgTableState } from './core/ng-table-state.service';

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
    NgTableState,
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
    this._state.data = this._data;
  }

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
               private _state: NgTableState,
  ) {
    (this._dataService as any)['_cellService'] = _cellService; // this is a hack for circular dependency
  }

  ngOnInit () {
    this._state.configurations = this.configurations;

    this.isEditing = this.configs.editing.enabled;

    this.patchConfigs();
    this.deActiveCellOnClickedOutside();
    this.watchFormModeChanges();
  }

  ngOnDestroy (): void {
    this._ngZone.runOutsideAngular(() => {
      document.removeEventListener('click', this.deActiveCellOnClickedOutside['listener']);
    });
  }

  ngAfterViewInit (): void {
  }

  trackByIndex (index) {
    return index;
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

  private deActiveCellOnClickedOutside() {
    const eventListener = this.deActiveCellOnClickedOutside['listener'] = event => {
      const $element = event.target;
      const isDataCell = $element.tagName.toLowerCase() === 'data-only-cell';

      let hasTableCellAtr = false;
      if (!isDataCell) {
        const isTd = $element.tagName.toLowerCase() === 'td';
        hasTableCellAtr = isTd && $element.getAttributeNames().includes('table-cell');
      }

      if (!(isDataCell || hasTableCellAtr)) {
        this._cellService.setActive(null);
        this._addingCellService.setActive(null);
      }
    };

    this._ngZone.runOutsideAngular(() => document.addEventListener('click', eventListener));
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

}
