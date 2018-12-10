import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'ga-input-type-number',
  templateUrl: './input-type-number.component.html',
  styleUrls: ['./input-type-number.component.scss']
})
export class InputTypeNumberComponent implements OnInit {

    readOnly: boolean;
    placeholder: any = '';
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

    ngOnInit(): void {
    }

}
