/* tslint:disable:component-selector */
import { ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { TableDataService } from '../data/table-data.service';
import { createAddress } from './cell-manager.utils';
import { CellManager } from './cell-manager.service';
import { CellService } from './cell.service';
import { Subscription } from 'rxjs';
import { intersectionBy } from 'lodash';
import { TableColumnConfigurations } from '../table.models';

const log = (...message) => console.log('TableCellComponent', ...message);

@Component({
  selector: '[table-cell]',
  templateUrl: './table-cell.component.html',
  styleUrls: ['./table-cell.component.scss']
})
export class TableCellComponent implements OnInit, OnDestroy {

  @Input() row: number;
  @Input() column: number;
  @Input() group: any;

  @Input() columnWord: string;
  @Input() wordAddress: string;

  @Input() columnConfigs: TableColumnConfigurations;
  @Input() readonly = false;

  public prop: string;
  public active = false;

  private subscription: Subscription;

  constructor (public cd: ChangeDetectorRef,
               private _cellService: CellService,
               private _cellManager: CellManager,
               private _dataService: TableDataService,
               private _elementRef: ElementRef,
  ) {
    (this._dataService as any)['_cellService'] = _cellService; // this is a hack for circular dependency
  }

  ngOnInit () {
    this.prop = this.columnConfigs.prop as string;

    this._cellManager.register(this);
    this.subscription = this._cellService.getActive().pipe(map(active => active === this))
      .subscribe(active => {
        this.active = active;
        this.cd.detectChanges();
        if (active) {
          let elementToFocus;

          if (this.columnConfigs.dataType === 'select') {
            elementToFocus = this._elementRef.nativeElement.querySelector('select');
          } else {
            elementToFocus = this._elementRef.nativeElement.querySelector('input');
          }

          if (elementToFocus) {
            elementToFocus.focus();
          }
        }
      });
  }

  ngOnDestroy (): void {
    this._cellManager.unregister(this);
    this.subscription.unsubscribe();
  }

  @HostListener('click.out-zone')
  onClicked() {
    if (this.readonly) {
      return;
    }

    console.log('this.columnConfigs.editable', this.columnConfigs.editable);
    console.log('this.columnConfigs.editable', this.columnConfigs.editableWhen);

    if (!this.columnConfigs.editable) {
      this._cellService.setActive(null);
      return;
    }

    if (this.columnConfigs.editableWhen && this.columnConfigs.editableWhen(this.entireRow)) {
      this._cellService.setActive(this);
      return;
    }

    console.log('active!');
    this._cellService.setActive(this);
  }

  onBlurred () {
    this._cellService.setActive(null);
  }

  onKeyUp ({keyCode}: KeyboardEvent) {
    if (keyCode === 13) { // enter key
      this._cellService.saveEditedValue();
    }
  }

  @HostBinding('class')
  get cellClass() {
    const defaultClass = this.getDefaultClassBasedOnType();
    return (this.columnConfigs.dataClass || '') + ' ' + defaultClass;
  }

  get options() {
    if (!this.columnConfigs.partialOptions) {
      return this.columnConfigs.options;
    }

    const ids = this.columnConfigs.partialOptions(this.entireRow).map(i => ({id: i}));

    return intersectionBy(this.columnConfigs.options, ids, 'id');
  }

  get entireRow() {
    return this._dataService.getRow(this.row, this.group);
  }

  get address () {
    return createAddress(this.row, this.column);
  }

  get formControl() {
    return this._cellService.formControl;
  }

  get dataChanges() {
    return this._dataService.changes(this.row, this.column, this.group);
  }

  get data () {
    return this._dataService.getValue(this.row, this.column, this.group);
  }

  get cell() {
    return this._dataService.getCell(this.row, this.column, this.group);
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
