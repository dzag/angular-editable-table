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

  public readonly data: CellData[][] = [];
  public rowGroups;
  public readonly descriptors;

  private internalData;

  constructor (private readonly configs: TableConfigurations,
               public readonly initialData,
  ) {
    this.descriptors = configs.states.columns;
    this.initialData = cloneDeep(initialData);
    this.internalData = cloneDeep(initialData);
    this.data = this.buildRows(this.internalData, this.descriptors, this.configs.states.rowGroups);
  }

  getCell(row, col) {
    return this.data[row][col];
  }

  getCellValue(row, col) {
    return this.getCell(row, col).value;
  }

  setCell(row, col, cell: CellData) {
    this.data[row][col] = cell;
    this.patchInitialData(row, col, cell.value);
  }

  setCellValue(row, col, value: any) {
    this.setCell(row, col, {value});
  }

  private patchInitialData(row, col, newValue) {
    this.initialData[row][this.getProp(col)] = newValue;
  }

  private getProp(column: number) {
    return this.descriptors[column]['prop'];
  }

  private buildRows<T> (data: Object[], descriptors, rowGroups?: any[]) {
    if (!data) {
      return;
    }

    if (rowGroups) {
      const group = rowGroups[0];
      const grouped = groupBy(data, group.groupBy);
      const groups = {};
      Object.entries(grouped).forEach(([key, value], index) => {
        groups[key] = {
          $$index: index,
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
      // const flattedData = flatMap(Object.values(grouped));
      // console.log(flattedData);
      // flattedData.forEach(d => {
      //   d['$$groupIndex'] = 0;
      // });
    }

    return data.map(item => {
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
