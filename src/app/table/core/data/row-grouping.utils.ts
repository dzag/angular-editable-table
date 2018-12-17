export function getCachedArray (object, key) {
  let cachedArray = object[key];
  if (!cachedArray) {
    object[key] = cachedArray = [];
  }
  return cachedArray;
}

export function doGroupFromCriteria (_data, _criteria, parentPath?) {
  const _dataMap = {};
  _data.forEach((d, dataIndex) => {
    const value = !parentPath ? d[_criteria] : parentPath + d[_criteria];
    let cachedArray = _dataMap[value];
    if (!cachedArray) {
      cachedArray = [];
      _dataMap[value] = cachedArray;
    }
    d.$$index = dataIndex;
    cachedArray.push(d);
  });
  return _dataMap;
}

export function getParentKey (childKey: string) {
  const lastDot = childKey.lastIndexOf('.');
  return lastDot ? childKey.substr(0, lastDot) : childKey;
}
