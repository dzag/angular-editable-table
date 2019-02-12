import { ChangeDetectorRef } from '@angular/core';
import { cloneDeep, initial, isNil, last, merge, remove, set } from 'lodash';
import { Subject } from 'rxjs';
import { TableColumnGroupsConfiguration, TableConfigs } from './table.models';
import { DEFAULT_CONFIGS } from './default-configs';

type ColumnIndex = number;
type ColumnName = string;

interface ConfigSetterOptions {
  detect?: boolean;
  emmitEvent?: boolean;
  type?: string;
}

const defaultSetterOptions: ConfigSetterOptions = {
  detect: true,
  emmitEvent: true,
  type: 'table'
};

export class TableConfigurations {
  public readonly states: TableConfigs;

  public readonly hiddenActions = new Map();
  public hasSubHeader = false;

  private _cd: ChangeDetectorRef;
  private _headerCd: ChangeDetectorRef;

  private _changes = new Subject();
  private _changeObs =  this._changes.asObservable();

  constructor (private initialConfigs: TableConfigs) { // TODO: Add type to this
    const initial = cloneDeep(this.initialConfigs);
    this.states = this.mergeDefaultConfigs(initial);
  }

  // -- columns configs
  renameColumn(columnIndex: number, newName: string) {
    this.set(`columns[${columnIndex}].name`, newName, {
      type: 'header'
    });
  }

  renameColumns(...columns: [ColumnIndex, ColumnName][]) {
    const batches = columns.map(([index, name]) => [`columns[${index}].name`, name]);
    this.setBatches(batches, 'header');
  }

  setOptions(columnIndex: number, newOptions: any[]) {
    const column = this.states.columns[columnIndex];
    column.options = newOptions;
    column['$$options'] = this.createIdToValueMap(newOptions);

    this.detectChanges();
  }

  // -- columns groups
  /**
   * @deprecated use renameColumnGroupById instead
   * @param path
   * @param newName
   */
  renameGroup(path: string, newName: string) {
    this.set('columnGroups' + path, newName, {
      type: 'header'
    });
  }

  /**
   * @deprecated use renameColumnGroupsById
   * @param groups
   */
  renameGroups(...groups: [string, string][]) {
    const newGroupNames = groups.map(([path, newName]) => ['columnGroups' + path, newName]);
    this.setBatches(newGroupNames, 'header');
  }

  renameColumnGroupById(id: any, newName: string) {
    const foundGroup = this.findGroupById(this.states.columnGroups, id);
    if (foundGroup) {
      this.setRaw(foundGroup, 'groupName', newName, {
        type: 'header'
      });
    }
  }

  renameColumnGroupsById(...groups: [any, string][]) {
    const ids = groups.map(([id]) => id);
    const batches = this.findGroupByIds(this.states.columnGroups, ids).map(([id, group]) => {
      const [gId, gName] = groups.find(([gId]) => gId === id);
      return [group, 'groupName', gName];
    });
    console.log(batches);
    if (batches.length) {
      this.setBatchesRaw(batches, 'header');
    }
  }

  // -- actions configs
  hideActionType(typeToHide: string, actionIndex: number = 0) {
    if (!this.states.actions[actionIndex]) {
      return false;
    }

    const array = this.getHiddenArray(actionIndex);
    const foundTypeToHide = array.find(i => i === typeToHide);

    if (foundTypeToHide) {
      return false;
    }

    array.push(typeToHide);
    this.detectChanges();
    return true;
  }

  showActionType(typeToShow: string, actionIndex: number = 0) {
    if (!this.states.actions[actionIndex]) {
      return false;
    }

    const array: string[] = this.getHiddenArray(actionIndex);
    const foundTypeToShowIndex = array.findIndex(i => i === typeToShow);
    if (foundTypeToShowIndex < 0) {
      return false;
    }

    array.splice(foundTypeToShowIndex, 1);
    this.detectChanges();
    return true;
  }

  // -- editing configs
  setEditing(enabled: boolean) {
    this.set('editing.enabled', enabled);
  }

  // -- paging configs

  /**
   * This method will not emit back to the onPageChanged, only reflects to the view
   */
  setPage({ pageNumber, pageSize }: { pageNumber?: number, pageSize?: number }) {
    const noTrigger: ConfigSetterOptions = { detect: false, emmitEvent: false };

    if (!isNil(pageSize)) {
      this.set('paging.pageSize', pageSize, noTrigger);
      this.set('paging.pageNumber', 1, noTrigger);
    }

    if (!isNil(pageNumber)) {
      this.set('paging.pageNumber', pageNumber, noTrigger);
    }

    this.detectChanges();
  }

  setTotalRecords(totalRecords) {
    if (isNil(totalRecords)) {
      return;
    }

    this.set('paging.totalRecords', totalRecords);
  }

  private mergeDefaultConfigs(initialConfig: TableConfigs): TableConfigs {
    const mergedConfigs: TableConfigs | any = {};

    mergedConfigs.columns = (initialConfig.columns || []).map(col => {
      if (col.subHeader) {
        this.hasSubHeader = true;
      }
      const newCol = Object.assign({...DEFAULT_CONFIGS.column}, col);

      if (newCol.options) {
        newCol['$$options'] = this.createIdToValueMap(newCol.options);
      }

      if (newCol.dataType === 'link' && newCol.link) {
        newCol.useRouter = isNil(col.useRouter) ? false : col.useRouter;
      }

      return newCol;
    });

    if (initialConfig.columnGroups) {
      mergedConfigs.columnGroups = initialConfig.columnGroups;
    }

    if (initialConfig.rowGroups) {
      mergedConfigs.rowGroups = initialConfig.rowGroups.map(rGroup => {
        let { summaries, ...defaultConfig } = DEFAULT_CONFIGS.rowGroup;

        const newRowGroup = Object.assign(cloneDeep(defaultConfig), rGroup);

        let actions;
        if (rGroup.actions) {
          actions = rGroup.actions.map(action => Object.assign({ ...DEFAULT_CONFIGS.action }, action));
          newRowGroup.actions = actions;
        }

        summaries = cloneDeep(rGroup.summaries) || {};
        if (!summaries.hasOwnProperty('0')) {
          merge(summaries, { 0: DEFAULT_CONFIGS.rowGroup.summaries[0] });
        }

        newRowGroup.summaries = summaries;

        return newRowGroup;
      });
    }

    if (initialConfig.formulas) {
      mergedConfigs.formulas = Object.assign({}, initialConfig.formulas);
    }

    mergedConfigs.editing = Object.assign({...DEFAULT_CONFIGS.editing}, initialConfig.editing);

    mergedConfigs.rowIdentifier = initialConfig.rowIdentifier || DEFAULT_CONFIGS.rowIdentifier;

    mergedConfigs.index = Object.assign({...DEFAULT_CONFIGS.index}, initialConfig.index);

    mergedConfigs.actions = (initialConfig.actions || []).map(action => {
      return Object.assign({...DEFAULT_CONFIGS.action}, action);
    });

    mergedConfigs.paging = Object.assign({...DEFAULT_CONFIGS.paging}, initialConfig.paging);

    console.log('mergedConfigs', mergedConfigs);

    return mergedConfigs;
  }

  private createIdToValueMap(options) {
    return options.reduce((prev, current) => {
      prev[current.id] = current.value;
      return prev;
    }, {});
  }

  private detectChanges(type: 'table' | 'header' = 'table') {
    const detector: ChangeDetectorRef = type === 'table' ? this._cd
      : type === 'header' ? this._headerCd
      : undefined;

    if (detector) {
      detector.markForCheck();
      return;
    }

    Promise.resolve().then(() => {
      if (detector) {
        detector.detectChanges();
      }
    });
  }

  private getHiddenArray(actionIndex): string[] {
    const action = this.states.actions[actionIndex];
    return this.hiddenActions.get(action) || this.hiddenActions.set(action, []).get(action);
  }

  private findGroupById(groups: TableColumnGroupsConfiguration[], id) {
    for (const group of groups) {
      if (group.id === id) {
        return group;
      }

      if (group.subGroups) {
        return this.findGroupById(group.subGroups, id);
      }
    }

    return null;
  }

  private findGroupByIds(groups: TableColumnGroupsConfiguration[], ids: any[], fresh = true) {
    ids = [...ids];
    const foundGroups = this.findGroupByIds['foundGroups'] = fresh ? [] : this.findGroupByIds['foundGroups'];
    for (const group of groups) {
      if (ids.includes(group.id)) {
        foundGroups.push([group.id, group]);
        remove(ids, i => i === group.id);
      }

      if (group.subGroups) {
        this.findGroupByIds(group.subGroups, ids, false);
      }
    }
    return foundGroups;
  }

  // -- setters

  private set(path: string, value, options?: ConfigSetterOptions) {
    this.setRaw(this.states, path, value, options);
  }

  private setRaw(object, path, value, options?: ConfigSetterOptions) {
    options = merge({...defaultSetterOptions}, options);
    set(object, path, value);

    if (options.detect) {
      this.detectChanges(options.type as any);
    }

    if (options.emmitEvent) {
      this._changes.next(options.type);
    }
  }

  private setBatches(batches: any[][], type = 'table') {
    initial(batches).forEach(tx => set.apply(this, [this.states].concat(tx)));
    this.set.apply(this, last(batches).concat({ type }));
  }

  private setBatchesRaw(batches: any[][], type = 'table') {
    initial(batches).forEach(tx => set.apply(this, tx));
    this.setRaw.apply(this, last(batches).concat({ type }));
  }
}
