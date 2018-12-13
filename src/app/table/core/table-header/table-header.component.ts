import { Component, Input, OnInit } from '@angular/core';
import { ColumnDescriptor, ColumnGroup } from '../table.models';
import { buildPropToPathMap, emptyArrays, getPath, insertAt, pushEmptyArrays, totalSubGroupProps, depth as getDepth } from '../table.utils';
import { get, last } from 'lodash';

type RowSpan = number;
type ColSpan = number;
type GroupName = string;
type GroupClass = string;
type HeaderTuple = [GroupName, GroupClass, RowSpan, ColSpan];
type Group = {
  name: string,
  class: string,
};

@Component({
  selector: '[table-header]',
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.scss']
})
export class TableHeaderComponent implements OnInit {
  @Input() subHeaders;
  @Input() withIndex;
  @Input() class;
  @Input() prop;

  @Input()
  get descriptors (): ColumnDescriptor<Object>[] {
    return this._descriptors;
  }

  set descriptors (value: ColumnDescriptor<Object>[]) {
    this._descriptors = value;
    this.headers = this.buildHeaders();
  }

  @Input()
  get colGroups (): ColumnGroup<Object>[] {
    return this._colGroups;
  }

  set colGroups (value: ColumnGroup<Object>[]) {
    this._colGroups = value || [];
    this.headers = this.buildHeaders();
  }

  public headers;

  private _descriptors;
  private _colGroups = [];
  indexName;
  indexClass;

  constructor() { }

  ngOnInit() {}

  /**
   * This also build another matrix for the table header
   */
  private buildHeaders () {
    const isValidColGroupsInput = this.colGroups.length !== 0;
    if (!isValidColGroupsInput) {
      const headers = this.descriptors
        .map(descriptor => ([descriptor.colName, descriptor.colClass, 1, 1]));

      if (this.withIndex) {
        headers.unshift([this.indexName, this.indexClass, 1, 1]);
      }

      return [headers];
    }

    const propToGroupIndexMap: any = buildPropToPathMap(this.colGroups);

    /*
      groupNames should have a structure like this
      [
         [ {name, class},
           {name, class},
           [{ name, class}, {name, class}, '0.0']
           0],
         {name, class},
         {name, class},
      ]
     */
    const groups: any[] = [];
    const mainGroupArrayCache = {};
    const simpleCache = {};

    for (const descriptor of this.descriptors) {
      const hasDescriptorsProp = propToGroupIndexMap.hasOwnProperty(descriptor.prop);
      const objectToAdd = {name: descriptor.colName || '', class: descriptor.colClass};
      if (hasDescriptorsProp) {
        const simplePath = propToGroupIndexMap[descriptor.prop];
        const isSubgroup = simplePath.indexOf('.') >= 0;

        const path: string = getPath(propToGroupIndexMap[descriptor.prop]);

        const cache = mainGroupArrayCache;
        let cachedArray = cache[path];
        if (!cachedArray) {
          cachedArray = [];
          cachedArray.push(path);
          cachedArray.unshift(objectToAdd);
          cache[path] = cachedArray;
          simpleCache[simplePath] = cachedArray;

          if (!isSubgroup) {
            groups.push(cachedArray);
          } else {
            const parentProp = simplePath.substr(0, simplePath.lastIndexOf('.'));
            const arr = get(simpleCache, parentProp) as any[];

            if (arr) { // fix an edge case where there is no parent props
              insertAt(arr, arr.length - 1, cachedArray);
            } else {
              const realPath = getPath(parentProp);
              const newArray = [];
              newArray.push(realPath);
              insertAt(newArray, newArray.length - 1, cachedArray);
              cache[realPath] = newArray;
              simpleCache[parentProp] = newArray;
              groups.push(newArray);
            }
          }

        } else {
          insertAt(cachedArray, cachedArray.length - 1, objectToAdd);
        }
      } else {
        groups.push(objectToAdd);
      }
    }

    // makes groups be a candidate for recursive call
    groups.push('$$root');

    const depth = getDepth(groups);

    // [ [Dates, 1, 6]   , []                  , []                   , []                    , []               , []               , [Something, 1, 2], []              ,
    //   [Noi Dung, 3, 1], [Ngay bat dau, 3, 1], [Dates 2, 1, 2]      , []                    , [Dates 3, 1, 2]  , []               , [Tong tien, 3, 1], [Dung sai, 3, 1],
    //   []             , []                  , [Ngay ket thuc, 2, 1], [Dates sub, 1, 1]     , [Tinh hinh, 2, 1], [Trang thai, 2, 1], []               , [],
    //   []             , []                  , []                   , [Kien toan viem, 1, 1], []               , []                , [],              , [],             ]
    const groupTuple = emptyArrays(depth);
    let deepLevel = -1;
    const traverseGroups = (_groups: any[]) => {
      deepLevel++;
      const groupPath = last(_groups);
      // log('traverse', 'groupName', deepLevel, (get(this.colGroups, groupPath) || {} as any).groupName || '');

      const theGroup = get(this._colGroups, groupPath);
      if (theGroup) {
        const propsLength = theGroup.subGroups
          ? totalSubGroupProps(theGroup.subGroups) + theGroup.props.length
          : theGroup.props.length;
        groupTuple[deepLevel - 1].push([theGroup.groupName, '', 1, propsLength]);
        pushEmptyArrays(groupTuple[deepLevel - 1], propsLength - 1);
      }
      _groups.forEach((group) => {
        const isObject = !Array.isArray(group);
        if (isObject) {
          if (typeof group !== 'string') {
            groupTuple[deepLevel].push([group.name, group.class, depth - deepLevel, 1]);
            for (let i = 1; i < depth - deepLevel; i++) {
              groupTuple[deepLevel + i].push([]);
            }
          }
        } else {
          traverseGroups(group);
        }
      });
      deepLevel--;
    };

    traverseGroups(groups);

    if (this.withIndex) {
      groupTuple.forEach((group, index) => {
        const toPrepend = index === 0
          ? [this.indexName, this.indexClass, depth, 1]
          : [];
        group.unshift(toPrepend);
      });
    }

    return groupTuple;
  }

}
