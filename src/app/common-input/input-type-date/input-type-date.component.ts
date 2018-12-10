import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

export const DATE_FORMAT = 'DD/MM/YYYY';

@Component({
  selector: 'ga-input-type-date',
  templateUrl: './input-type-date.component.html',
  styleUrls: ['./input-type-date.component.scss']
})
export class InputTypeDateComponent implements OnInit {
  placeholder: any = '';
  readOnly: boolean;
  _formControlInput: FormControl = new FormControl();

  datePickerFormat = DATE_FORMAT.toLowerCase();
  datePickerConfig = {
    dateInputFormat: DATE_FORMAT
  };

  set formControlInput (control: FormControl) {
    if (control) {
      this._formControlInput = control;
    }
  }

  get formControlInput () {
    return this._formControlInput;
  }

  _data = {};

  get data () {
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
    if (data.readOnly) {
        this.readOnly = data.readOnly;
    }
}

  ngOnInit () {
  }
}
