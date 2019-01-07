import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { AddingDataService } from '../table-cell-for-adding/adding-data.service';
import { TableCellForAddingComponent } from '../table-cell-for-adding/table-cell-for-adding.component';
import { AddingCellService } from '../table-cell-for-adding/adding-cell.service';
import { TableDataService } from '../data/table-data.service';
import { TableConfigs } from '../table.models';
import { TableData } from '../table-data';

@Component({
  selector: '[adding-row]',
  templateUrl: './adding-row.component.html',
  styleUrls: ['./adding-row.component.scss'],
  providers: [
    AddingDataService,
  ]
})
export class AddingRowComponent implements OnInit, AfterViewInit, OnDestroy {
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

  private _event;

  constructor (private _addingDataService: AddingDataService,
               private _addingCellService: AddingCellService,
               private _tableDataService: TableDataService,
               private _cd: ChangeDetectorRef,
               private _elementRef: ElementRef,
               private _ngZone: NgZone,
  ) {
  }

  ngOnInit () {
    this.onActivatedCellChanged();
  }

  ngAfterViewInit (): void {
    this.deactiveOnClickedOutside();
  }

  ngOnDestroy (): void {
    this._ngZone.runOutsideAngular(() => document.removeEventListener('click', this._event));
  }

  trackByIndex (index) {
    return index;
  }

  isActiveCell (cell: any) {
    return this.activeCell === cell;
  }

  onAddClick (event) {
    this._addingCellService.setActive(null);
    this._tableDataService.addRow(this._addingDataService.addingRowData);
    this.createRow(this._data);
  }

  private onActivatedCellChanged () {
    this._addingCellService.activeCell.subscribe((cell) => {
      this.activeCell = cell;
      this._cd.detectChanges();
    });
  }

  private deactiveOnClickedOutside () {
    const $addingRow: HTMLElement = this._elementRef.nativeElement;
    const eventListener = this._event = event => {
      if (!$addingRow.contains(event.target)) {
        this._addingCellService.setActive(null);
      }
    };

    this._ngZone.runOutsideAngular(() => document.addEventListener('click', eventListener));
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
