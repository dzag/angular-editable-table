const wordMapper = {
  A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, K: 9, L: 10,
  M: 11, N: 12, O: 13, P: 14, Q: 15, R: 16, S: 17, T: 18, U: 19, V: 20, W: 21, X: 22, Y: 23, Z: 24
};

export const createAddress = (row, column): string => row + '_' + column;

export const getLocation = (address: string) => {
  const [row, column] = address.split('_');
  return {row: +row, column: +column};
};

export const createAddressFromStringLocator = (str: string) => {
  const [word, row] = str.split('.');
  const col = wordMapper[word];
  return createAddress(row, col);
};

export const getLocationFromStringLocator = (str: string) => {
  return getLocation(createAddressFromStringLocator(str));
};

function area (start: string, end: string, array: string[]) {
  const startLocation = getLocation(start);
  const endLocation = getLocation(end);
  const largestRow = Math.max(startLocation.row, endLocation.row);
  const largestColumn = Math.max(startLocation.column, endLocation.column);
  const smallestRow = Math.min(startLocation.row, endLocation.row);
  const smallestColumn = Math.min(startLocation.column, endLocation.column);

  return array.filter(address => {
    const { row, column } = getLocation(address);
    return row <= largestRow && row >= smallestRow && column <= largestColumn && column >= smallestColumn;
  });
}
