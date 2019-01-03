import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TableCellForAddingComponent } from './table-cell-for-adding.component';
import { AddingCellService } from './adding-cell.service';
import { pairwise } from 'rxjs/operators';

type CellOrNull =  TableCellForAddingComponent | null;

@Injectable()
export class AddingDataService {
  public addingRowData: any = {};
  public readonly formControl = new FormControl();

  constructor (private _addingCellService: AddingCellService) {
    _addingCellService.activeCell.pipe(pairwise()).subscribe(([prev, current]: [CellOrNull, CellOrNull]) => {
      if (prev !== current) {
        if (prev !== null) {
          this.saveEditedValue(prev);
        }

        this.formControl.reset(null, { emitEvent: false });
      }

      if (current) {
        Promise.resolve().then(() => this.formControl.setValue(current.data));
      }
    });
  }

  saveEditedValue (cell: TableCellForAddingComponent) {
    this.addingRowData[cell.columnConfigs.prop] = this.formControl.value;
  }
}

