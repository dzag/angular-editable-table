import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'input-type-select',
  templateUrl: './input-type-select.component.html',
  styleUrls: ['./input-type-select.component.scss']
})
export class InputTypeSelectComponent implements OnInit {
  placeholder: any = '';
  _formControlInput: FormControl = new FormControl();
  options: Array<any> = [];
  set formControlInput(control: FormControl) {
    if (control) {
      this._formControlInput = control;
    }
  }

  get formControlInput() {
    return this._formControlInput;
  }

  _data = {};

  get data() {
    return this._data;
  }

  set data(data: any) {
    this._data = data;
    if (!data) {
      return;
    }
    if (data.placeholder) {
      this.placeholder = data.placeholder;
    }
    if (data.options) {
      this.options = data.options;
    }
  }

  ngOnInit() {
  }
}
