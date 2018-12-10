import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'ga-input-type-textarea',
  templateUrl: './input-type-textarea.component.html',
  styleUrls: ['./input-type-textarea.component.scss']
})
export class InputTypeTextareaComponent implements OnInit {
  readOnly: boolean;
  placeholder = '';
  row: number;
  _formControlInput: FormControl = new FormControl();
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
    if (data.row) {
      this.row = data.row;
    }
    if (data.readOnly) {
      this.readOnly = data.readOnly;
    }
  }

  ngOnInit(): void {
  }

}
