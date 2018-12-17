import { Component, Input, OnInit } from '@angular/core';
import { buildPropToPathMap, depth as getDepth, emptyArrays, getPath, insertAt, pushEmptyArrays, totalSubGroupProps } from '../table.utils';
import { get, last } from 'lodash';
import { TableConfigurations } from '../table-configurations';
import { DomSanitizer } from '@angular/platform-browser';

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
  @Input() indexClass;

  @Input() configurations: TableConfigurations;

  public headers;

  constructor(public domSanitizer: DomSanitizer) { }

  ngOnInit() {
    this.headers = this.buildHeaders();
    this.watchConfigsChanges();
  }

  get indexName() {
    const indexConfigs = this.configurations.states.index;
    return indexConfigs ? indexConfigs.name || 'STT' : 'STT';
  }

  /**
   * This also build another matrix for the table header
   */
  private buildHeaders () {
    const colGroups = this.configurations.states.columnGroups;
    const columnConfigs = this.configurations.states.columns;

    const isValidColGroupsInput = (colGroups || []).length !== 0;
    if (!isValidColGroupsInput) {
      const headers = columnConfigs
        .map(column => ([this.domSanitizer.bypassSecurityTrustHtml(column.name), column.headerClass, 1, 1]));

      if (this.withIndex) {
        headers.unshift([this.indexName, this.indexClass, 1, 1]);
      }

      return [headers];
    }

    const propToGroupIndexMap: any = buildPropToPathMap(colGroups);

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

    for (const descriptor of columnConfigs) {
      const hasDescriptorsProp = propToGroupIndexMap.hasOwnProperty(descriptor.prop);
      const objectToAdd = {name: descriptor.name || '', class: descriptor.headerClass};
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

    const groupTuple = emptyArrays(depth);
    let deepLevel = -1;
    const traverseGroups = (_groups: any[]) => {
      deepLevel++;
      const groupPath = last(_groups);

      const theGroup = get(colGroups, groupPath);
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
            groupTuple[deepLevel].push([this.domSanitizer.bypassSecurityTrustHtml(group.name), group.class, depth - deepLevel, 1]);
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

  private buildSubHeaders () {
    const descriptors = this.configurations.states.columns;
    return descriptors.map(descriptor => descriptor.subHeader || '');
  }

  private watchConfigsChanges() {
    this.configurations['changeObs'].subscribe(() => {
      this.headers = this.buildHeaders();
    });
  }

}
