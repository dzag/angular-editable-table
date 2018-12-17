import { ChangeDetectorRef } from '@angular/core';
import { set, cloneDeep, merge } from 'lodash';
import { Subject } from 'rxjs';

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
  options?: any[]; // for select dataType
  link?: any; // for link dataType
  useRouter?: boolean; // for link dataType
}

export interface Configs extends Anything {
  columns: TableColumnConfigurations[];
  rowGroups?: any;
  columnGroups?: any;
  rowIndexType?: any;
  rowIndexPattern?: any;
}

export class TableConfigurations {
  public readonly states: Configs;

  private _cd: ChangeDetectorRef;
  private _headerCd: ChangeDetectorRef;

  private changes = new Subject();
  private changeObs =  this.changes.asObservable();

  constructor (private initialConfigs: Configs) { // TODO: Add type to this
    this.states = cloneDeep(this.initialConfigs);
  }

  renameColumn(columnIndex: number, newName: string) {
    this.set(`columns[${columnIndex}].colName`, newName);
  }

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
