import { TableDataService } from './data/table-data.service';
import { TableConfigurations } from './table-configurations';

const removeMetaData = <T> (data: T[], idKey): Partial<T>[] => {
  return data.map((d: any) => {
    const { [idKey]: id, __generated, ...rest } = d;
    return rest;
  });
};


export class TableData {

  private _configs: TableConfigurations;
  private _dataService: TableDataService;

  constructor (public initialData = []) {}

  getCurrentData(removeMeta = false): any[] {
    if (!this._dataService) {
      return this.initialData;
    }

    const data = this._dataService.tableDataInternal.internalData;
    if (removeMeta) {
      const idKey = this._configs.states.rowIdentifier;
      return removeMetaData(data, idKey);
    }

    return data;
  }

  delete(rowIndex, group?) {
    this._dataService.deleteRow(rowIndex, group);
  }

  add(data, groupPath?) {
    if (groupPath) {
      // TODO: implement for group
      return;
    }

    this._dataService.addRow(data);
  }

  getDeleted() {
    return this._dataService.tableDataInternal.deleted;
  }

  getAdded (removeMeta = false) {
    const data = this._dataService.tableDataInternal.internalData;
    const generatedData = data.filter(d => d.__generated);
    if (removeMeta) {
      const idKey = this._configs.states.rowIdentifier;
      return removeMetaData(generatedData, idKey);
    }

    return generatedData;
  }

}
