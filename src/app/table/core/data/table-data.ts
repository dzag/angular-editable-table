import { cloneDeep } from 'lodash';

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

  constructor (public readonly descriptors,
               public readonly initialData,
  ) {
    this.data = this.buildRows(descriptors, initialData);
    this.initialData = cloneDeep(initialData);
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

  private buildRows<T> (descriptors, data: Object[] | null | undefined) {
    if (!data) {
      return;
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
