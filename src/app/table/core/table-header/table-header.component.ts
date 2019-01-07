import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { buildPropToPathMap, depth as getDepth, emptyArrays, getPath, insertAt, pushEmptyArrays, totalSubGroupProps } from '../table.utils';
import { get, last } from 'lodash';
import { DomSanitizer } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';
import { NgTableState } from '@app/table/core/ng-table-state.service';

@Component({
  selector: '[table-header]',
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.scss']
})
export class TableHeaderComponent implements OnInit {
  @Input() class;

  public headers;
  public subHeaders;

  constructor(public domSanitizer: DomSanitizer,
              public state: NgTableState,
              private _cd: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.configurations['_headerCd'] = this._cd;

    this.headers = this.buildHeaders();

    if (this.configurations.hasSubHeader) {
      this.subHeaders = this.buildSubHeaders();
    }

    this.watchConfigsChanges();
  }

  get indexClass() {
    return this.state.configurations.states.index.class;
  }

  get withIndex() {
    return this.state.showIndex;
  }

  get withActions() {
    return this.state.showActions;
  }

  get actions() {
    if (!this.withActions) {
      return [];
    }

    return this.state.configurations.states.actions || [];
  }

  get configurations() {
    return this.state.configurations;
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

      if (this.withActions && this.actions.length > 0) {
        this.actions.forEach(action => {
          headers.push([action.name, action.class || [], 1, 1]);
        });
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
      const objectToAdd = {name: descriptor.name || '', class: descriptor.headerClass || ''};
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
        const groupName = this.domSanitizer.bypassSecurityTrustHtml(theGroup.groupName);
        groupTuple[deepLevel - 1].push([groupName, theGroup.groupClass || '', 1, propsLength]);
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

    if (this.withActions && this.actions.length > 0) {
      groupTuple.forEach((group, index) => {
        const toPrepend = this.actions.map(action => {
           if (index === 0) {
             return [action.name, action.class || '', depth, 1];
           }
           return [];
         }
        );
        group.push(...toPrepend);
      });
    }

    return groupTuple;
  }

  private buildSubHeaders () {
    const descriptors = this.configurations.states.columns;
    let subHeaders = descriptors.map(descriptor => ({
      name: descriptor.subHeader || '',
      class: descriptor.subHeaderClass || ''
    }));

    if (this.withActions) {
      subHeaders = subHeaders.concat(this.actions.map(action => ({
        name: action.subHeader || '',
        class: action.subHeaderClass || ''
      })));
    }

    return subHeaders;
  }

  private watchConfigsChanges() {
    (this.configurations as any)['_changeObs'].pipe(filter(t => t === 'header')).subscribe(() => {
      this.headers = this.buildHeaders();
    });
  }

}
