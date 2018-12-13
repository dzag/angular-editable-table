import { ChangeDetectorRef } from '@angular/core';
import { set, cloneDeep } from 'lodash';
import { Subject } from 'rxjs';

interface ConfigSetterOptions {
  detect?: boolean;
}

const defaultSetterOptions: ConfigSetterOptions = {
  detect: true
};

export class TableConfigurations {
  public readonly states: any;

  private _cd: ChangeDetectorRef;
  private _headerCd: ChangeDetectorRef;

  private changes = new Subject();
  private changeObs =  this.changes.asObservable();

  constructor (private initialConfigs) { // TODO: Add type to this
    this.states = cloneDeep(this.initialConfigs);
  }

  renameColumn(columnIndex: number, newName: string) {
    this.set(`columns[${columnIndex}].colName`, newName);
  }

  private set(path: string, value, options: ConfigSetterOptions = defaultSetterOptions) {
    set(this.states, path, value);

    if (options.detect) {
      this.detectChanges();
    }
  }

  private detectChanges(type: 'table' | 'header' = 'table') {
    const detector: ChangeDetectorRef = type === 'table' ? this._cd
      : type === 'header' ? this._headerCd
      : undefined;

    if (detector) {
      this.changes.next();
      return detector.detectChanges();
    }

    Promise.resolve().then(() => {
      if (detector) {
        this.changes.next();
        detector.detectChanges();
      }
    });
  }

}
