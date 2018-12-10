import { AbstractControl } from '@angular/forms';
import { EventEmitter } from '@angular/core';

export abstract class InputTypeBase<T> {
  formControlInput: AbstractControl;
  _data: any = {};

  get data() {
    return this._data;
  }

  set data(data: T) {
    for (let key of Object.keys(data)) {
      this._data[key] = data[key];
    }
  }
}

export interface IDataInput {
  placeholder?: string;
}

export interface IDataSelect extends IDataInput {
  options?: Array<any>;
  valueType?: string;
  idType?: string;
  outputType?: string;
  multiple?: boolean;
  disabled?: boolean;
}

export interface IDataSelectBasic extends IDataInput {
  options?: Array<any>;
  firstOption?: string;
  firstOptionValue?: string;
  valueType?: string;
  idType?: string;
}

export interface IDataText extends IDataInput {
  search?: Function;
  selected: EventEmitter<any>;
  valueType?: any;
  options?: Array<any>;
}

export interface IDataTextarea extends IDataInput {
  rows?: any;
}

// export interface IDataDate extends IDataInput {

// }

export interface IDataCheckbox extends IDataInput {
  text?: string;
}

export interface IDataFile extends IDataInput {
  type?: number;
}

export interface IDataRadio extends IDataInput {
  inline?: boolean;
  options?: Array<IDataRadioOption>;
}

export interface IDataRadioOption {
  text?: string;
  value?: any;
  class?: string;
}
