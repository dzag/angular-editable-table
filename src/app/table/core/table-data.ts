import { returnOutside } from './table-cell/cell-manager.service';
import { Observable } from 'rxjs';
import { TableDataService } from './data/table-data.service';

export class TableData {

  private _dataService: TableDataService;

  constructor (public initialData) {
  }

  setData(data) {
    this.initialData = data;
  }

  getDataSnapshot(): Observable<any[]> {
    return returnOutside(() => {
      return this._dataService.tableDataInternal.initialData;
    });
  }

  delete(index, group?) {
    this._dataService.deleteRow(index, group);
  }

  get deleted() {
    return this._dataService.tableDataInternal.deleted;
  }

}
