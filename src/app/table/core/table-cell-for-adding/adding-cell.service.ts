import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TableCellForAddingComponent } from './table-cell-for-adding.component';

const log = (...message) => console.log('AddingService', ...message);

@Injectable()
export class AddingCellService {

  private activatedCell$ = new BehaviorSubject<TableCellForAddingComponent | null>(null);
  private activatedCellObs$ = this.activatedCell$.asObservable();

  constructor () {
  }

  setActive(cell: TableCellForAddingComponent) {
    this.activatedCell$.next(cell);
  }

  setDeactive(cell) {
    if (this.activatedCell$.getValue() === cell) {
      this.activatedCell$.next(null);
    }
  }

  get activeCell() {
    return this.activatedCellObs$;
  }
}
