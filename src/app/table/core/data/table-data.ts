import { cloneDeep, groupBy, flatMap, isNil, get, mapValues, set, repeat } from 'lodash';
import * as deepMerge from 'deepmerge';
import { TableConfigurations } from '../table-configurations';

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
  }

  getCell (row, col, group?) {
    if (group) {
      return this.rowGroups[group]['data'][row][col];
    }
    return this.data[row][col];
  }

  getCellValue (row, col, group?) {
    return this.getCell(row, col, group).value;
  }

  setCell (row, col, group, cell: CellData) {
    if (group) {
      this.rowGroups[group]['data'][row][col] = cell;
    } else {
      this.data[row][col] = cell;
    }
    this.patchInitialData(row, col, group, cell.value);
  }

  setCellValue (row, col, group, value: any) {
    this.setCell(row, col, group, { value });
  }

  private patchInitialData (row, col, group, newValue) {
    if (group) {
      this.groupData[group][row][this.getProp(col)] = newValue;
    } else {
      this.initialData[row][this.getProp(col)] = newValue;
    }
  }

  private getProp (column: number) {
    return this.descriptors[column]['prop'];
  }

  private buildRows<T> (data: Object[], descriptors, rowGroups?: any[]) {
    if (!data) {
      return;
    }
    const isGroup = rowGroups && rowGroups.length > 0;
    const isSimple = !isGroup;

    if (isSimple) {
      this.data = data.map(item => {
        const row = [];
        descriptors.forEach(({ prop, link, transformer }) => {
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
      return;
    }

    if (isGroup) {

      const nest = function (seq, keys) {
        if (!keys.length) {
          return seq;
        }
        const [first, ...rest] = keys;
        return mapValues(groupBy(seq, first), value => nest(value, rest));
      };

      const nestedData = nest(data, rowGroups.map(g => g.groupBy));
      console.log('nestedData', nestedData);

      const path = [];
      const indexes = [];
      let depth = 0;
      const rs = {};
      const traverse = (obj) => {
        Object.entries(obj).forEach(([key, value], index) => {
          path.push(key);
          indexes.push(index);
          if (typeof value === 'object' && Array.isArray(value)) {
            const array = obj[key];
            const parentPath = path.join('.');
          } else if (typeof value === 'object' && !Array.isArray(value)) {
            depth++;
            const subs = repeat('subGroups.', depth);
            const subsPath = key + '.' + subs.substring(0, subs.length - 1);
            const sub = get(rs, subsPath);
            if (!sub) {
              set(rs, subsPath, []);
            } else {
              // set(rs, subsPath, sub.concat(value));
            }
            console.log(subs.substring(0, subs.length - 1));
            traverse(obj[key]);
            depth--;
          }
          path.pop();
          indexes.pop();
        });
      };

      traverse(nestedData);
      console.log(rs);

      const group = rowGroups[0];
      const grouped = groupBy(data, group.groupBy);
      this.groupData = grouped;

      const groups = {};
      Object.entries(grouped).forEach(([key, value], index) => {
        groups[key] = {
          $$index: index,
          $$indexFunc: getIndexFunc(group),
          groupName: group.name(value[0]),
          data: value.map(item => {
            const row = [];
            descriptors.forEach(({ prop, link, transformer }) => {
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
      console.log('this.rowGroups', this.rowGroups);
      return;
    }
  }

}

const wrapSquare = word => `[${word}]`;

const getIndexFunc = (group) => {
  if (group.indexPattern) {
    return group.indexPattern;
  }

  if (group.indexType === 'romanNumeral') {
    return romanize;
  }
  return (i => i + 1);
};

function defaultIndex () {

}

function romanize (num) {
  const lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
  let roman = '';
  for (const i in lookup) {
    if (Object.prototype.hasOwnProperty.apply(lookup, i)) {
      while (num >= lookup[i]) {
        roman += i;
        num -= lookup[i];
      }
    }
  }
  return roman;
}
