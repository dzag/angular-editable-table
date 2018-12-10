// See: https://gist.github.com/hapticdata/08c9d7f9e18e2ab72e715264c251f46e
import { ColumnGroup } from './table.models';

function maxDepth (a) {
  let maxVal = Number.MIN_VALUE;
  let item;

  a.forEach(val => {
    let _depth = depth(val);
    if (_depth > maxVal) {
      maxVal = _depth;
      item = val;
    }
  });

  return item;
}

export function depth (a, count = 0) {
  return Array.isArray(a) ? depth(maxDepth(a), count + 1) : count;
}

// This method modify object
// If shallowClone = true then it will not
export function insertAt <T> (array: T[], index: number, data: T, shallowClone = false) {
  if (shallowClone) {
    array = [...array];
  }

  array.splice(index, 0, data);
  return array;
}

export function emptyArrays (number: number) {
  const array = [];
  for (let i = 0; i < number; i++) {
    array.push([]);
  }
  return array;
}

export function pushEmptyArrays (targetArray, number: number) {
  for (let i = 0; i < number; i++) {
    targetArray.push([]);
  }
  return targetArray;
}

export function buildPropToPathMap (colGroups: ColumnGroup<any>[]) {
  const obj = {};
  const indexStack = [];
  const makeObject = (_groups) => {
    _groups.forEach((group, index) => {
      indexStack.push(index);
      group.props.forEach(p => {
        obj[p] = `${indexStack.join('.')}`;
      });
      if (group.subGroups && group.subGroups.length > 0) {
        makeObject(group.subGroups);
      }
      indexStack.pop();
    });
  };
  makeObject(colGroups);
  return obj;
}

export function totalSubGroupProps(colGroups: ColumnGroup<any>[]) {
  let total = 0;
  const countProps = (gr) => {
    gr.forEach(g => {
      total += (g.props || []).length;
      if (g.subGroups && g.subGroups.length) {
        countProps(g.subGroups);
      }
    });
  };
  countProps(colGroups);
  return total;
}

export function getPath (simplePath: string | null | undefined) {
  if (!simplePath) {
    return simplePath;
  }

  if (simplePath.indexOf('.') < 0) {
    return `[${simplePath}]`;
  }

  return simplePath.split('.').map(i => `[${i}]`).join('.subGroups');
}
