import { TableColumnConfigurations } from '../table.models';

const romanNumeralLookup = {
  M: 1000, CM: 900, D: 500, CD: 400,
  C: 100, XC: 90, L: 50, XL: 40,
  X: 10, IX: 9, V: 5, IV: 4, I: 1,
};

const alphabet = {
  1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F', 7: 'G', 8: 'H', 9: 'I', 10: 'J',
  11: 'K', 12: 'L', 13: 'M', 14: 'N', 15: 'O', 16: 'P', 17: 'Q', 18: 'R', 19: 'S',
  20: 'T', 21: 'U', 22: 'V', 23: 'W', 24: 'X', 25: 'Y', 26: 'Z'
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

  if (group.indexType === 'alphabet') {
    return (index) => alphabet[index + 1];
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
