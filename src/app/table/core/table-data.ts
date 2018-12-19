import { returnOutside } from './table-cell/cell-manager.service';
import { Observable } from 'rxjs';
import { TableDataService } from './data/table-data.service';

export class TableData {

  private _dataService: TableDataService;

  constructor (public initialData = []) {}

  getDataSnapshot(): Observable<any[]> {
    return returnOutside(() => {
      return this._dataService.tableDataInternal.initialData;
    });
  }

  delete(rowIndex, group?) {
    this._dataService.deleteRow(rowIndex, group);
  }

  get deleted() {
    return this._dataService.tableDataInternal.deleted;
  }

}
