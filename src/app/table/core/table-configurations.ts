import { ChangeDetectorRef } from '@angular/core';
import { set, cloneDeep, merge } from 'lodash';
import { Subject } from 'rxjs';
import * as deepMerge from 'deepmerge';

interface ConfigSetterOptions {
  detect?: boolean;
  emmitEvent?: boolean;
}

const defaultSetterOptions: ConfigSetterOptions = {
  detect: true,
  emmitEvent: true,
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
  options?: any[]; // for select dataType
  link?: any; // for link dataType
  useRouter?: boolean; // for link dataType
  map?: Function;
  reverseMap?: Function;
}

export interface Configs extends Anything {
  columns: TableColumnConfigurations[];
  rowGroups?: any;
  columnGroups?: any;
  index?: {
    name?: string;
    show?: boolean; // default: true
    rowIndexType?: any;
    rowIndexPattern?: any;
  };
  actions?: {
    show?: boolean,
    name?: string;
    types?: any,
    actionsOnRow?: any,
    clicked?: any
  };
}

const defaultConfigs: Configs = {
  columns: [],
  rowGroups: [],
  columnGroups: [],
  index: {
    show: true,
  },
  actions: {
    show: false,
  }
};

export class TableConfigurations {
  public readonly states: Configs;

  private _cd: ChangeDetectorRef;
  private _headerCd: ChangeDetectorRef;

  private changes = new Subject();
  private changeObs =  this.changes.asObservable();

  constructor (private initialConfigs: Configs) { // TODO: Add type to this
    const initial = cloneDeep(this.initialConfigs);
    this.states = deepMerge({...defaultConfigs}, initial);
  }

  // -- columns configs
  renameColumn(columnIndex: number, newName: string) {
    this.set(`columns[${columnIndex}].name`, newName);
  }

  // -- actions configs

  private set(path: string, value, options?: ConfigSetterOptions) {
    options = merge({...defaultSetterOptions}, options);
    set(this.states, path, value);

    if (options.detect) {
      this.detectChanges();
    }

    if (options.emmitEvent) {
      this.changes.next();
    }
  }

  private detectChanges(type: 'table' | 'header' = 'table') {
    const detector: ChangeDetectorRef = type === 'table' ? this._cd
      : type === 'header' ? this._headerCd
      : undefined;

    if (detector) {
      return detector.detectChanges();
    }

    Promise.resolve().then(() => {
      if (detector) {
        detector.detectChanges();
      }
    });
  }

}
