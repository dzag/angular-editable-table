import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { createAddress, getLocation, getLocationFromStringLocator } from './cell-manager.utils';
import { TableCellComponent } from './table-cell.component';

const log = (...message) => console.log('CellManager', ...message);

export const returnOutside = (fn): Observable<any> => {
  return new Observable(observer => {
    Promise.resolve().then(() => { // this is a trick to push the code to the event loop
      observer.next(fn());
      observer.complete();
    });
  });
};

interface Location {
  row: number;
  column: number;
}

@Injectable()
export class CellManager {

  private _addressCellMap = new Map<string, TableCellComponent>();
  private _cellAddressMap = new Map<TableCellComponent, string>();

  register (cell: TableCellComponent) {
    const address = createAddress(cell.row, cell.column);
    this._addressCellMap.set(address, cell);
    this._cellAddressMap.set(cell, address);
  }

  unregister(cell: TableCellComponent) {
    this._cellAddressMap.delete(cell);
    this._addressCellMap.delete(createAddress(cell.row, cell.column));
  }

  detectChanges(location: Location) {
    this.getCell(location).subscribe(cell => {
      cell.cd.detectChanges();
    });
  }

  getCell (locationOrAddress: Location | string): Observable<TableCellComponent> {
    if (typeof locationOrAddress !== 'string') {
      locationOrAddress = createAddress(locationOrAddress.row, locationOrAddress.column);
    }

    return returnOutside(() => this._addressCellMap.get(locationOrAddress as string));
  }

  getCellsInRow (row: number): Observable<TableCellComponent[]> {
    return returnOutside(() => {
      const results = [];
      this._addressCellMap.forEach((value, key) => {
        const { row: currentRow } = getLocation(key);
        if (row === currentRow) {
          results.push(value);
        }
      });
      return results;
    });
  }

  getCellsInColumn(column: number): Observable<TableCellComponent[]> {
    return returnOutside(() => {
      const results = [];
      this._addressCellMap.forEach((value, key) => {
        const { column: currentColumn } = getLocation(key);
        if (column === currentColumn) {
          results.push(value);
        }
      });
      return results;
    });
  }

  // TODO: This could be optimize by caching the address then just pick whatever the address we need
  getCellsInArea(start: string, end: string): Observable<TableCellComponent[]> {
    const startLocation = getLocationFromStringLocator(start);
    const endLocation = getLocationFromStringLocator(end);
    const largestRow = Math.max(startLocation.row, endLocation.row);
    const largestColumn = Math.max(startLocation.column, endLocation.column);
    const smallestRow = Math.min(startLocation.row, endLocation.row);
    const smallestColumn = Math.min(startLocation.column, endLocation.column);

    return returnOutside(() => {
      const results = [];
      this._addressCellMap.forEach((value, key) => {
        const { row, column } = value;
        if (row <= largestRow && row >= smallestRow && column <= largestColumn && column >= smallestColumn) {
          results.push(value);
        }
      });
      return results;
    });
  }

}
