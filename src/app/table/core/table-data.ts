import { TableDataInternal } from './data/table-data-internal';
import { returnOutside } from './table-cell/cell-manager.service';
import { Observable } from 'rxjs';

export class TableData {

  private _internalData: TableDataInternal;

  constructor (public readonly initialData) {
  }

  getDataSnapshot(): Observable<any[]> {
    return returnOutside(() => {
      return this._internalData.initialData;
    });
  }

}
