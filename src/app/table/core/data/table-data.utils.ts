import { TableColumnConfigurations } from '../table-configurations';

const romanNumeralLookup = {
  M: 1000, CM: 900, D: 500, CD: 400,
  C: 100, XC: 90, L: 50, XL: 40,
  X: 10, IX: 9, V: 5, IV: 4, I: 1,
};

export function romanize (index) {
  let num = index + 1;
  let roman = '';
  Object.entries(romanNumeralLookup).forEach(([k, value]) => {
    while (num >= value) {
      roman += k;
      num -= value;
    }
  });
  return roman;
}

export function getIndexFunction (group) {
  if (group.indexPattern) {
    return group.indexPattern;
  }

  if (group.indexType === 'romanNumeral') {
    return romanize;
  }

  return i => i + 1;
}

export function mapToTableCells (columnConfigs: TableColumnConfigurations[], item) {
  const row = [];

  columnConfigs.forEach(({prop, link, map: _map}) => {
    const result: any = {};
    result.value = _map
      ? _map(item[prop])
      : item[prop];

    if (link) {
      result.url = link(item);
    }
    row.push(result);
  });
  return row;
}
