import { cloneDeep, forEachRight, get, repeat, set } from 'lodash';
import { TableConfigurations } from '../table-configurations';
import { doGroupFromCriteria, getCachedArray, getParentKey } from './row-grouping.utils';

// const nest = function (seq, keys) {
//   if (!keys.length) {
//     return seq;
//   }
//   const [first, ...rest] = keys;
//   return mapValues(groupBy(seq, first), value => nest(value, rest));
// };

const wordMapper = {
  A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, K: 9, L: 10,
  M: 11, N: 12, O: 13, P: 14, Q: 15, R: 16, S: 17, T: 18, U: 19, V: 20, W: 21, X: 22, Y: 23, Z: 24
};

export interface CellData {
  value: any;
  url?: string;
}

export class TableData {

  public data: CellData[][] = [];

  public rowGroups;
  public readonly descriptors;

  private groupData: any;
  private internalData;

  constructor (private readonly configs: TableConfigurations,
               public readonly initialData,
  ) {
    this.descriptors = configs.states.columns;
    this.initialData = cloneDeep(initialData);
    this.internalData = cloneDeep(initialData);
    this.buildRows(this.internalData, this.descriptors, this.configs.states.rowGroups);
    this.buildGroupedRows(this.internalData, this.descriptors, this.configs.states.rowGroups);
  }

  getCell (row, col, group?) {
    if (group) {
      const path = this.getDataRowPath(group.$$path, row);
      return get(this.rowGroups, path)[col];
    }
    return this.data[row][col];
  }

  getCellValue (row, col, group?) {
    return this.getCell(row, col, group).value;
  }

  setCell (row, col, group, cell: CellData) {
    if (group) {
      const path = this.getGroupPath(group.$$path);
      set(this.rowGroups, path + `[${row}][${col}]`, cell);
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
      group.$$data[row][col] = newValue;
    } else {
      this.initialData[row][this.getProp(col)] = newValue;
    }
  }

  private getProp (column: number) {
    return this.descriptors[column]['prop'];
  }

  private buildGroupedRows<T> (data: Object[], descriptors, rowGroups?: any[]) {
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
      const $$groupIndex = index;
      if (index === groupedRows.length - 1) {
        Object.entries(dataMap).forEach(([k, v]: [string, any[]]) => {
          const parentKey = getParentKey(k);
          const toPush: any = {
            $$indexFunc: getIndexFunc(group),
            $$data: v,
            $$groupIndex,
            name: group.name(v[0]),
            data: v.map(item => mapToTableCells(descriptors, item)),
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
          const _data = get(v, '[0]' + subGroupsPath + '.$$data[0]');
          const parentKey = getParentKey(k);
          const cacheArray = getCachedArray(prevGroupedRowsMap, parentKey);
          cacheArray.push({
            $$indexFunc: getIndexFunc(group),
            $$data: v,
            $$groupIndex,
            name: group.name(_data),
            subGroups: v
          });
        });
      } else {
        const subGroupsPath = repeat('.subGroups[0]', groupedRows.length - 2);
        Object.entries(prevGroupedRowsMap).forEach(([k, v]) => {
          const _data = get(v, '[0]' + subGroupsPath + '.$$data[0]');
          result.push({
            $$indexFunc: getIndexFunc(group),
            $$data: v,
            $$groupIndex,
            name: group.name(_data),
            subGroups: v,
          });
        });
      }
    });
    return result;
  }

  private buildSimpleRows (data: Object[], descriptors) {
    return data.map(item => mapToTableCells(descriptors, item));
  }

  private buildRows<T> (data: Object[], descriptors, rowGroups?: any[]) {
    if (!data) {
      return;
    }
    const isGroup = rowGroups && rowGroups.length > 0;
    if (isGroup) {
      const _rowGroups = this.buildGroupedRows(data, descriptors, rowGroups);
      this.rowGroups = this.buildGroupData(_rowGroups);
      console.log('this.rowGroups', this.rowGroups);
      console.log('this.rowGroups', this.internalData);
      return;
    }

    this.data = this.buildSimpleRows(data, descriptors);
  }

  private buildGroupData (groupData) {
    let _deepLevel = 0;
    const _groupBuild = [...groupData];
    const indexes = [];
    const buildGroupData = (groupBuild): any => {
      _deepLevel++;
      const clone = [...groupBuild];

      clone.forEach((data, index) => {
        indexes.push(index);
        data.$$path = indexes.join('.');
        if (data.subGroups) {
          buildGroupData(data.subGroups);
        }
        indexes.pop();
      });
      _deepLevel--;
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

function mapToTableCells (descriptors, item) {
  const row = [];
  descriptors.forEach(({prop, link, transformer}) => {
    const result: any = {};
    result.value = transformer
      ? transformer(item[prop])
      : item[prop];

    if (link) {
      result.url = link(item);
    }
    row.push(result);
  });
  return row;
}

const wrapSquare = word => `[${word}]`;

const getIndexFunc = (group) => {
  if (group.indexPattern) {
    return group.indexPattern;
  }

  if (group.indexType === 'romanNumeral') {
    return romanize;
  }

  return i => i + 1;
};

function defaultIndex () {

}

function romanize (index) {
  let num = index + 1;
  const lookup = {M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1};
  let roman = '';
  Object.entries(lookup).forEach(([k, value]) => {
    while (num >= value) {
      roman += k;
      num -= value;
    }
  });
  return roman;
}
