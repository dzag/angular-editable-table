import { Component, OnInit } from '@angular/core';
import { InputTypeBase, IDataCheckbox } from '../input-type.interface';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'ga-input-type-checkbox',
  templateUrl: './input-type-checkbox.component.html',
  styleUrls: ['./input-type-checkbox.component.scss']
})
export class InputTypeCheckboxComponent extends InputTypeBase<IDataCheckbox> implements OnInit {

  _formControlInput: FormControl = new FormControl();
  set formControlInput(control: FormControl) {
    if (control) {
      this._formControlInput = control;
    }
  }

  get formControlInput() {
    return this._formControlInput;
  }
  ngOnInit(): void {
    console.log(this.data);
    // throw new Error("Method not implemented.");
  }

}
