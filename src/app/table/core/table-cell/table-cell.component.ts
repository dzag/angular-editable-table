/* tslint:disable:component-selector */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { TableDataService } from '../data/table-data.service';
import { createAddress } from './cell-manager.utils';
import { CellManager } from './cell-manager.service';
import { CellService } from './cell.service';
import { TableColumnConfigurations } from '../table-configurations';
import { Subject, Subscription } from 'rxjs';

const words = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
  'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

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

  public rowspan = 1;
  public prop: string;

  public active = false;
  public readonly = false;

  private subscription: Subscription;

  constructor (private _cellService: CellService,
               private _cellManager: CellManager,
               private _dataService: TableDataService,
               public cd: ChangeDetectorRef,
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

    if (!this.columnConfigs.editable) {
      this._cellService.setActive(null);
      return;
    }

    this._cellService.setActive(this);
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

  get cellClass() {
    if (!this.columnConfigs.dataClass) {
      return;
    }

    return {
      [this.columnConfigs.dataClass]: true
    };
  }

  onKeyUp ({keyCode}: KeyboardEvent) {
    if (keyCode === 13) { // enter key
      this._cellService.saveEditedValue();
    }
  }
}
