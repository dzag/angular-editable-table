import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { distinctUntilChanged, filter, withLatestFrom } from 'rxjs/operators';
import { TableCellComponent } from './table-cell.component';
import { TableDataService } from '../data/table-data.service';

@Injectable()
export class CellService {

  private active$ = new BehaviorSubject(null);
  private activeObservable = this.active$.asObservable().pipe(distinctUntilChanged());

  public readonly formControl = new FormControl();

  constructor (private dataService: TableDataService) {
    this.formControl.valueChanges
      .pipe(
        withLatestFrom(this.active$.pipe(filter(active => !!active)))
      ).subscribe(([formValue, activeCell]: [any, TableCellComponent]) => {
        const { row, column, group } = activeCell;
        this.dataService.setValue(row, column, group, formValue, { detect: false });
    });
  }

  setActive (cell: TableCellComponent | null) {
    this.active$.next(cell);
    this.formControl.reset(null, {emitEvent: false});
    if (cell) {
      Promise.resolve().then(() => {
        this.formControl.setValue(this.dataService.getValue(cell.row, cell.column, cell.group), { emitEvent: false });
      });
    }
  }

  getActive () {
    return this.activeObservable;
  }

}
