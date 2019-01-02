import { Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { TableColumnConfigurations } from '../table.models';
import { AddingCellService } from './adding-cell.service';
import { AddingDataService } from './adding-data.service';

@Component({
  selector: '[table-cell-adding]',
  templateUrl: './table-cell-for-adding.component.html',
  styleUrls: ['./table-cell-for-adding.component.scss']
})
export class TableCellForAddingComponent implements OnInit, OnDestroy {

  @Input() columnConfigs: TableColumnConfigurations;
  @Input() column: number;

  @Input()
  get active (): boolean {
    return this._active;
  }

  set active (value: boolean) {
    this._active = value;
    if (this._active) {
      Promise.resolve().then(() => {
        let elementToFocus;

        if (this.columnConfigs.dataType === 'select') {
          elementToFocus = this._elementRef.nativeElement.querySelector('select');
        } else {
          elementToFocus = this._elementRef.nativeElement.querySelector('input');
        }

        if (elementToFocus) {
          elementToFocus.focus();
        }
      });
    }
  }

  private _active: boolean;

  constructor (private _addingCellService: AddingCellService,
               private _addingDataService: AddingDataService,
               private _elementRef: ElementRef,
  ) { }

  ngOnInit () {
  }

  ngOnDestroy (): void {
  }

  @HostListener('click.out-zone')
  click() {
    this._addingCellService.setActive(this);
  }

  onKeyUp ({keyCode}: KeyboardEvent) {
    if (keyCode === 13) { // enter key
      this._addingDataService.saveEditedValue(this);
    }
  }

  @HostBinding('class')
  get cellClass() {
    const defaultClass = this.getDefaultClassBasedOnType();
    return (this.columnConfigs.dataClass || '') + ' ' + defaultClass;
  }

  onBlurred () {
    this._addingCellService.setDeactive(this);
  }

  get formControl() {
    return this._addingDataService.formControl;
  }

  get options() {
    return this.columnConfigs.options;
  }

  get data() {
    return this._addingDataService.addingRowData[this.columnConfigs.prop];
  }

  private getDefaultClassBasedOnType() {
    const dataType = this.columnConfigs.dataType;
    if (dataType === 'date') {
      return 'text-center';
    }

    if (['number', 'currency'].includes(dataType)) {
      return 'text-right';
    }

    return '';
  }
}
