import { cloneDeep, forEachRight, get, repeat, set } from 'lodash';
import { TableColumnConfigurations, TableConfigurations } from '../table-configurations';
import { doGroupFromCriteria, getCachedArray, getParentKey } from './row-grouping.utils';
import { getIndexFunction, mapToTableCells } from './table-data.utils';
import { TableData } from '../table-data';

export interface GroupData {
  name: string;
}

const wordMapper = {
  A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, K: 9, L: 10,
  M: 11, N: 12, O: 13, P: 14, Q: 15, R: 16, S: 17, T: 18, U: 19, V: 20, W: 21, X: 22, Y: 23, Z: 24
};

export interface CellData {
  value: any;
  url?: string;
}

export class TableDataInternal {

  public data: CellData[][] = [];
  public groupData;

  public readonly columnConfigs: TableColumnConfigurations[];
  private internalData;

  public readonly initialData: any[];

  public readonly deleted = [];

  constructor (private readonly configs: TableConfigurations,
               private readonly tableData: TableData,
  ) {
    this.columnConfigs = configs.states.columns;
    this.initialData = cloneDeep(tableData.initialData);
    this.internalData = cloneDeep(tableData.initialData);
    this.buildRows(this.internalData, this.columnConfigs, this.configs.states.rowGroups);
  }

  getRow (row, group?) {
    if (group) {
      const index = this.internalData.findIndex(i => i === group.originalData[row]);
      return this.initialData[index];
    }

    return this.initialData[row];
  }

  deleteRow (row, group?) {
    console.log(row, group);
    if (group) {
      const index = this.initialData.findIndex(i => i === group.originalData[row]);
      group.data.splice(row, 1);
      this.deleted.push(this.initialData.splice(index, 1)[0]);
      return;
    }
    this.data.splice(row, 1);
    this.deleted.push(this.initialData.splice(row, 1)[0]);
  }

  getCell (row, col, group?) {
    if (group) {
      const path = this.getDataRowPath(group.path, row);
      return get(this.groupData, path)[col];
    }
    return this.data[row][col];
  }

  getCellValue (row, col, group?) {
    return this.getCell(row, col, group).value;
  }

  setCell (row, col, group, cell: CellData) {
    if (group) {
      const path = this.getGroupPath(group.path);
      set(this.groupData, path + `[${row}][${col}]`, cell);
    } else {
      this.data[row][col] = cell;
    }
    this.patchInitialData(row, col, group, cell.value);
  }

  setCellValue (row, col, group, value: any) {
    this.setCell(row, col, group, {value});
  }

  private patchInitialData (row, col, group, newValue) {
    if (group) {
      const rowData = group.originalData[row];
      rowData[col] = newValue;
      const initialDataIndex = this.internalData.findIndex(i => i === rowData);
      this.initialData[initialDataIndex][this.getProp(col)] = newValue;
    } else {
      this.initialData[row][this.getProp(col)] = newValue;
    }
  }

  private getProp (column: number) {
    return this.columnConfigs[column]['prop'];
  }

  private buildRows<T> (data: Object[], columnConfigs: TableColumnConfigurations[], rowGroups?: any[]) {
    if (!data) {
      return;
    }
    const isGroup = rowGroups && rowGroups.length > 0;
    if (isGroup) {
      const _rowGroups = this.buildGroupedRows(data, columnConfigs, rowGroups);
      this.groupData = this.buildGroupData(_rowGroups);
      return;
    }

    this.data = this.buildSimpleRows(data, columnConfigs);
  }

  private buildSimpleRows (data: Object[], columnsConfigs: TableColumnConfigurations[]) {
    return data.map(item => mapToTableCells(columnsConfigs, item));
  }

  private buildGroupedRows<T> (data: Object[], columnConfigs: TableColumnConfigurations[], rowGroups?: any[]) {
    const groupedRows = [];
    rowGroups.forEach((group, groupIndex) => {
      const criteria = group.groupBy;
      if (groupIndex === 0) {
        const dataMap = doGroupFromCriteria(data, criteria);
        groupedRows.push({
          group,
          dataMap
        });
      } else {
        const parent = groupedRows[groupIndex - 1].dataMap;
        const datas = [];
        Object.entries(parent).forEach(([key, groupedParent]: [any, any]) => {
          const dataMap = doGroupFromCriteria(groupedParent, criteria, key + '.');
          datas.push(dataMap);
        });
        const final = {};
        datas.forEach(d => Object.assign(final, d));
        groupedRows.push({
          group,
          dataMap: final
        });
      }
    });

    const result = [];
    let prevGroupedRowsMap = {};
    forEachRight(groupedRows, ({ dataMap, group }, index) => {
      const groupIndex = index;
      if (index === groupedRows.length - 1) {
        Object.entries(dataMap).forEach(([k, v]: [string, any[]]) => {
          const parentKey = getParentKey(k);
          const toPush: any = {
            indexFn: getIndexFunction(group),
            originalData: v,
            groupIndex,
            name: group.name(v[0]),
            data: v.map(item => mapToTableCells(columnConfigs, item)),
          };
          if (!parentKey) {
            result.push(toPush);
          } else {
            const cachedArray = getCachedArray(prevGroupedRowsMap, parentKey);
            cachedArray.push(toPush);
          }
        });
      } else if (index > 0) {
        const copiedPrevMap = {...prevGroupedRowsMap};
        prevGroupedRowsMap = {};
        const subGroupsPath = repeat('.subGroups[0]', groupedRows.length - 2 - index);
        Object.entries(copiedPrevMap).forEach(([k, v]) => {
          const _data = get(v, '[0]' + subGroupsPath + '.originalData[0]');
          const parentKey = getParentKey(k);
          const cacheArray = getCachedArray(prevGroupedRowsMap, parentKey);
          cacheArray.push({
            indexFn: getIndexFunction(group),
            originalData: v,
            groupIndex,
            name: group.name(_data),
            subGroups: v
          });
        });
      } else {
        const subGroupsPath = repeat('.subGroups[0]', groupedRows.length - 2);
        Object.entries(prevGroupedRowsMap).forEach(([k, v]) => {
          const _data = get(v, '[0]' + subGroupsPath + '.originalData[0]');
          result.push({
            indexFn: getIndexFunction(group),
            originalData: v,
            groupIndex,
            name: group.name(_data),
            subGroups: v,
          });
        });
      }
    });
    return result;
  }

  private buildGroupData (groupData) {
    const _groupBuild = [...groupData];
    const indexes = [];
    const buildGroupData = (groupBuild): any => {
      const clone = [...groupBuild];

      clone.forEach((data, index) => {
        indexes.push(index);
        data['path'] = indexes.join('.');
        if (data.subGroups) {
          buildGroupData(data.subGroups);
        }
        indexes.pop();
      });
    };

    buildGroupData(_groupBuild);
    return _groupBuild;
  }

  private getDataRowPath(path, row) {
    return path.split('.').map(index => `[${index}]`).join('.subGroups') + `.data[${row}]`;
  }

  private getGroupPath(path) {
    return path.split('.').map(index => `[${index}]`).join('.subGroups') + `.data`;
  }

}
