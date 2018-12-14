import { cloneDeep, groupBy, flatMap } from 'lodash';
import { TableConfigurations } from '../table-configurations';

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
  private groupData: any;

  public rowGroups;
  public readonly descriptors;

  private internalData;

  constructor (private readonly configs: TableConfigurations,
               public readonly initialData,
  ) {
    this.descriptors = configs.states.columns;
    this.initialData = cloneDeep(initialData);
    this.internalData = cloneDeep(initialData);
    this.buildRows(this.internalData, this.descriptors, this.configs.states.rowGroups);
  }

  getCell(row, col, group?) {
    if (group) {
      return this.rowGroups[group]['data'][row][col];
    }
    return this.data[row][col];
  }

  getCellValue(row, col, group?) {
    return this.getCell(row, col, group).value;
  }

  setCell(row, col, group, cell: CellData) {
    if (group) {
      this.rowGroups[group]['data'][row][col] = cell;
    } else {
      this.data[row][col] = cell;
    }
    this.patchInitialData(row, col, group, cell.value);
  }

  setCellValue(row, col, group, value: any) {
    this.setCell(row, col, group, {value});
  }

  private patchInitialData(row, col, group, newValue) {
    if (group) {
      this.groupData[group][row][this.getProp(col)] = newValue;
    } else {
      this.initialData[row][this.getProp(col)] = newValue;
    }
  }

  private getProp(column: number) {
    return this.descriptors[column]['prop'];
  }

  private buildRows<T> (data: Object[], descriptors, rowGroups?: any[]) {
    if (!data) {
      return;
    }

    if (rowGroups && rowGroups.length > 0) {
      const group = rowGroups[0];
      const grouped = groupBy(data, group.groupBy);
      this.groupData = grouped;
      const groups = {};
      const getIndexFunc = () => {
        if (group.indexPattern) {
          return group.indexPattern;
        }

        if (group.indexType === 'romanNumeral') {
          return romanize;
        }
        return (i => i + 1);
      };

      Object.entries(grouped).forEach(([key, value], index) => {
        groups[key] = {
          $$index: index,
          $$indexFunc: getIndexFunc(),
          groupName: group.name(value[0]),
          data: value.map(item => {
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
          })
        };
      });
      this.rowGroups = groups;
      return;
    }

    this.data = data.map(item => {
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
    });
  }

}

function defaultIndex() {

}

function romanize(num) {
  let lookup = {M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1};
  let roman = '';
  for (const i in lookup ) {
    while ( num >= lookup[i] ) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}
