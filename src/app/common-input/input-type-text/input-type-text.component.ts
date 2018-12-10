import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { InputTypeBase, IDataText } from '../input-type.interface';
@Component({
  selector: 'input-type-text',
  templateUrl: './input-type-text.component.html',
  styleUrls: ['./input-type-text.component.scss']
})
export class InputTypeTextComponent extends InputTypeBase<IDataText> implements OnInit {
  readOnly: boolean;
  placeholder: any = '';
  value = '';
  _formControlInput: FormControl = new FormControl();

  set formControlInput(control: FormControl) {
    if (control) {
      this._formControlInput = control;
    }
  }

  get formControlInput() {
    return this._formControlInput;
  }

  _data: any = {};

  get data() {
    return this._data;
  }

  set data(data) {
    this._data = data;

    if (!data) {
      return;
    }
    if (data.placeholder) {
      this.placeholder = data.placeholder;
    }
    if (data.value) {
      this.value = data.value;
    }
    if (data.readOnly) {
      this.readOnly = data.readOnly;
    }
  }

  ngOnInit(): void {
  }
}
