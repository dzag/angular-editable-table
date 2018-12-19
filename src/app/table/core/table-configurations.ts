import { ChangeDetectorRef } from '@angular/core';
import { set, cloneDeep, merge } from 'lodash';
import { Subject } from 'rxjs';
import { ActionEvent } from './table.models';
import { DEFAULT_CONFIGS } from './default-configs';

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

export interface Anything {
  [p: string]: any;
}

export interface TableColumnConfigurations extends Anything {
  prop?: string;
  name?: string;
  dataType: string;
  editable?: boolean;
  headerClass?: string;
  dataClass?: string;
  subHeader?: string;
  subHeaderClass?: string;
  options?: any[]; // for select dataType
  link?: any; // for link dataType
  useRouter?: boolean; // for link dataType
  map?: Function;
  reverseMap?: Function;
}

export interface TableActionConfiguration extends Anything {
  show?: boolean; // default: false
  name?: string;
  class?: string;
  types?: any;
  static?: string[];
  actionsOnRow?: any;
  clicked?: (actionEvent: ActionEvent) => void;
}

export interface TableIndexConfiguration extends Anything {
  show?: boolean; // default: true
  name?: string;
  subHeader?: string;
  subHeaderClass?: string;
  rowIndexType?: any;
  rowIndexPattern?: any;
}

export interface Configs extends Anything {
  columns: TableColumnConfigurations[];
  rowGroups?: {
    groupBy?: string,
    name?: any,
    indexType?: string,
    indexPattern?: any,
  }[];
  columnGroups?: any;
  index?: TableIndexConfiguration;
  actions?: TableActionConfiguration[];
}

const defaultConfigs: Configs = {
  columns: [],
  rowGroups: [],
  columnGroups: [],
  index: {
    show: true,
  },
  actions: [],
};

export class TableConfigurations {
  public readonly states: Configs;

  public readonly hiddenActions = new Map();
  public hasSubHeader = false;

  private _cd: ChangeDetectorRef;
  private _headerCd: ChangeDetectorRef;

  private changes = new Subject();
  private changeObs =  this.changes.asObservable();

  constructor (private initialConfigs: Configs) { // TODO: Add type to this
    const initial = cloneDeep(this.initialConfigs);
    this.states = this.mergeDefaultConfigs(initial);
  }

  // -- columns configs
  renameColumn(columnIndex: number, newName: string) {
    this.set(`columns[${columnIndex}].name`, newName, {
      type: 'header'
    });
  }

  // -- columns groups
  renameGroup(path: string, newName: string, upLevel = 1) {
    this.set('columnGroups' + path, newName, {
      type: 'header'
    });
  }

  // -- actions configs
  hideActionType(actionIndex: number, typeToHide: string) {
    const array = this.getHiddenArray(actionIndex);
    const foundTypeToHide = array.find(i => i === typeToHide);

    if (foundTypeToHide) {
      return false;
    }

    array.push(typeToHide);
    this.detectChanges();
    return true;
  }

  showActionType(actionIndex: number, typeToShow: string) {
    const array: string[] = this.getHiddenArray(actionIndex);
    const foundTypeToShowIndex = array.findIndex(i => i === typeToShow);
    if (foundTypeToShowIndex < 0) {
      return false;
    }

    array.splice(foundTypeToShowIndex, 1);
    this.detectChanges();
    return true;
  }

  private mergeDefaultConfigs(initialConfig: Configs): Configs {
    const mergedConfigs: Configs | any = {};

    mergedConfigs.columns = initialConfig.columns.map(col => {
      if (col.subHeader) {
        this.hasSubHeader = true;
      }
      return Object.assign({...DEFAULT_CONFIGS.column}, col);
    });

    mergedConfigs.columnGroups = initialConfig.columnGroups;

    mergedConfigs.rowGroups = initialConfig.rowGroups;

    mergedConfigs.index = Object.assign({...DEFAULT_CONFIGS.index}, initialConfig.index);

    if (initialConfig.actions) {
      mergedConfigs.actions = initialConfig.actions.map(action => {
        return Object.assign({...DEFAULT_CONFIGS.action}, action);
      });
    }

    return mergedConfigs;
  }

  private set(path: string, value, options?: ConfigSetterOptions) {
    options = merge({...defaultSetterOptions}, options);
    set(this.states, path, value);

    if (options.detect) {
      this.detectChanges();
    }

    if (options.emmitEvent) {
      this.changes.next(options.type);
    }
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

}
