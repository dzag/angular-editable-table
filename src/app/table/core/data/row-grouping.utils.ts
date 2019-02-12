export function getCachedArray (object, key) {
  let cachedArray = object[key];
  if (!cachedArray) {
    object[key] = cachedArray = [];
  }
  return cachedArray;
}

export function groupByCriteria <T> (data: T[], groupByCriteria: string, parentPath?): { [p: string]: T[] };
export function groupByCriteria <T, R> (data: T[], groupByCriteria: string, parentPath?): { [p: string]: R[] } {
  const resultGroup = {};

  data.forEach((eachData) => {
    const groupByValue = !parentPath
      ? eachData[groupByCriteria]
      : parentPath + '.' + eachData[groupByCriteria];

    let groupedArray = resultGroup[groupByValue];
    if (!groupedArray) {
      groupedArray = [];
      resultGroup[groupByValue] = groupedArray;
    }

    eachData['$$groupPath'] = groupByValue;
    groupedArray.push(eachData);
  });

  return resultGroup;
}

export function extractParentKey (childKey: string) {
  const lastDot = childKey.lastIndexOf('.');
  return lastDot ? childKey.substr(0, lastDot) : childKey;
}
