import { cloneDeep, forEachRight, get, orderBy, repeat, set } from 'lodash';
import { TableConfigurations } from '../table-configurations';
import { TableColumnConfigurations, TableRowGroupsConfiguration } from '../table.models';
import { extractParentKey, getCachedArray, groupByCriteria } from './row-grouping.utils';
import { getIndexFunction, mapToTableCells } from './table-data.utils';
import { TableData } from '../table-data';

export interface GroupData<T> {
  [p: string]: T[];
}

export interface DataWithMeta extends AnyKindOfData {
  $$groupPath?: string;
}

export interface AnyKindOfData {
  [p: string]: any;
}

export interface InternalGroupData {
  indexFn?: Function;
  originalData?: any[];
  groupIndex?: number;
  configs?: TableRowGroupsConfiguration;
  name?: string;
  path?: string;
  data?: CellData[][];
  columns?: any[];
  subGroups?: InternalGroupData[];
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
  public isGroup = false;
  public isSimple = false;

  public data: CellData[][] = [];
  public groupData: InternalGroupData[];

  public readonly columnConfigs: TableColumnConfigurations[];
  public readonly initialData: any[];
  public readonly deleted = [];

  public readonly internalData: any[];

  constructor (private readonly configs: TableConfigurations,
               private readonly tableData: TableData,
  ) {
    this.isGroup = this.configs.states.rowGroups && this.configs.states.rowGroups.length > 0;
    this.isSimple = !this.isGroup;
    this.columnConfigs = configs.states.columns;
    this.initialData = cloneDeep(tableData.initialData);
    this.internalData = cloneDeep(tableData.initialData);
    this.buildRows(this.initialData, this.columnConfigs, this.configs.states.rowGroups);
  }

  getRow (row, group?) {
    if (group) {
      const index = this.initialData.findIndex(i => i === group.originalData[row]);
      return this.internalData[index];
    }

    return this.internalData[row];
  }

  addRow(columnsConfigs: TableColumnConfigurations[], newRowData: any | any[], group?) {
    if (group) {
      return;
    }

    newRowData = Array.isArray(newRowData) ? newRowData : [newRowData];
    const newRows = newRowData.map(row => mapToTableCells(columnsConfigs, row));
    this.data = this.data.concat(newRows);
    this.initialData.push(...newRowData);
    this.internalData.push(...newRowData);
  }

  deleteRow (row, group?) {
    if (group) {
      const index = this.initialData.findIndex(i => i === group.originalData[row]);
      group.data.splice(row, 1);
      group.originalData.splice(row, 1);

      this.initialData.splice(index, 1);
      this.deleted.push(this.internalData.splice(index, 1)[0]);
      return;
    }
    this.data.splice(row, 1);

    this.initialData.splice(row, 1);
    this.deleted.push(this.internalData.splice(row, 1)[0]);
  }

  getCell (row, col, group?) {
    if (group) {
      const path = this.getDataRowPath(group.path, row);
      const data = get(this.groupData, path);
      return data[col];
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
    const colProp = this.getProp(col);

    if (group) {
      const rowData = group.originalData[row];
      rowData[col] = newValue;
      const initialDataIndex = this.initialData.findIndex(i => i === rowData);
      this.initialData[initialDataIndex][colProp] = newValue;
      this.internalData[initialDataIndex][colProp] = newValue;
    } else {
      this.initialData[row][colProp] = newValue;
      this.internalData[row][colProp] = newValue;
    }
  }

  private getProp (column: number) {
    return this.columnConfigs[column]['prop'];
  }

  private buildRows<T> (data: Object[], columnConfigs: TableColumnConfigurations[], rowGroups?: any[]) {
    if (!data) {
      return;
    }

    if (this.isGroup) {
      const _rowGroups = this.buildGroupedRows(data, columnConfigs, rowGroups);
      this.groupData = this.buildGroupData(_rowGroups);
      return;
    }

    this.data = this.buildSimpleRows(data, columnConfigs);
  }

  private buildSimpleRows (data: Object[], columnsConfigs: TableColumnConfigurations[]) {
    return data.map(item => mapToTableCells(columnsConfigs, item));
  }

  private buildGroupedRows<T> (data: Object[], columnConfigs: TableColumnConfigurations[], rowGroups?: TableRowGroupsConfiguration[]) {
    const groupedRows: { groupData: GroupData<DataWithMeta> , groupConfigs: TableRowGroupsConfiguration }[] = [];
    rowGroups.forEach((groupConfigs, groupIndex) => {
      if (groupIndex === 0) {
        const groupData = groupByCriteria(data, groupConfigs.groupBy);
        groupedRows.push({ groupConfigs, groupData });
        return;
      }

      const groupData = {};
      const parent = groupedRows[groupIndex - 1].groupData;
      Object.entries(parent)
        .map(([key, groupedParent]: [any, any]) => groupByCriteria(groupedParent, groupConfigs.groupBy, key))
        .forEach(d => Object.assign(groupData, d)); // merge all props from object returned from doGroupFromCriteria into dataMap object
      groupedRows.push({ groupConfigs, groupData });
    });

    const result = [];
    let prevGroupedRowsMap = {};
    forEachRight(groupedRows, (groupRow, groupIndex) => {
      const { groupData, groupConfigs } = groupRow;
      if (groupIndex === groupedRows.length - 1) { // the last group
        this.objectEntriesWithOrders(groupData, groupConfigs).forEach(([key, arrayOfData]: [string, any[]]) => {
          const parentKey = extractParentKey(key);
          const objectToPush: InternalGroupData = {
            indexFn: getIndexFunction(groupConfigs),
            originalData: arrayOfData,
            groupIndex,
            configs: groupConfigs,
            columns: this.getGroupColumns(groupConfigs, arrayOfData[0]),
            data: arrayOfData.map(item => mapToTableCells(columnConfigs, item)),
          };
          if (!parentKey) {
            result.push(objectToPush);
          } else {
            const cachedArray = getCachedArray(prevGroupedRowsMap, parentKey);
            cachedArray.push(objectToPush);
          }
        });
      } else if (groupIndex > 0) { // other group
        const copiedPrevMap = {...prevGroupedRowsMap};
        prevGroupedRowsMap = {};
        const subGroupsPath = repeat('.subGroups[0]', groupedRows.length - 2 - groupIndex);
        this.objectEntriesWithOrders(copiedPrevMap, groupConfigs).forEach(([key, arrayOfChildGroups]) => {
          const _data = get(arrayOfChildGroups, '[0]' + subGroupsPath + '.originalData[0]');
          const parentKey = extractParentKey(key);
          const cacheArray = getCachedArray(prevGroupedRowsMap, parentKey);
          cacheArray.push({
            indexFn: getIndexFunction(groupConfigs),
            originalData: arrayOfChildGroups,
            groupIndex,
            configs: groupConfigs,
            columns: this.getGroupColumns(groupConfigs, _data),
            subGroups: arrayOfChildGroups
          } as InternalGroupData);
        });
      } else { // first group
        const subGroupsPath = repeat('.subGroups[0]', groupedRows.length - 2);
        this.objectEntriesWithOrders(prevGroupedRowsMap, groupConfigs).forEach(([key, arrayOfChildGroups]) => {
          const firstRow = get(arrayOfChildGroups, '[0]' + subGroupsPath + '.originalData[0]');
          result.push({
            indexFn: getIndexFunction(groupConfigs),
            originalData: arrayOfChildGroups,
            groupIndex,
            configs: groupConfigs,
            columns: this.getGroupColumns(groupConfigs, firstRow),
            subGroups: arrayOfChildGroups,
          } as InternalGroupData);
        });
      }
    });

    return result;
  }

  getGroupColumns (groupConfigs: TableRowGroupsConfiguration, firstRow) {
    let totalLength = this.configs.states.columns.length + this.configs.states.actions.length;
    totalLength = groupConfigs.namespan > totalLength ? totalLength : totalLength - groupConfigs.namespan + 1;

    const array = Array(totalLength).fill(undefined).map(() => ({
      value: '',
      type: '',
      colspan: 1,
    }) as any);

    const nameAtIndex = 0;
    array[nameAtIndex].value = groupConfigs.name(firstRow);
    array[nameAtIndex].type = 'name';
    array[nameAtIndex].colspan = !groupConfigs.summaries ? groupConfigs.namespan : 1;

    const actions = groupConfigs.actions;
    if (actions) {
      for (let i = this.configs.states.columns.length - groupConfigs.namespan + 1, j = 0; i < array.length; i++, j++) {
        if (actions[j]) {
          array[i].value = actions[j];
          array[i].type = 'actions';
        }
      }
    }

    return array;
  }

  private objectEntriesWithOrders (groupData: {[p: string]: any[]}, group: TableRowGroupsConfiguration) {
    let result = orderBy(Object.entries(groupData) as any, ([key]) => key, group.orders as any);
    if (group.dataOrders) {
      result = result.map(([key, value]) => ([
        key,
        orderBy.apply(null, [value].concat(group.dataOrders))
      ]));
    }
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
