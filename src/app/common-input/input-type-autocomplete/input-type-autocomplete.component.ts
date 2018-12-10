import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgSelectConfig } from '@ng-select/ng-select';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'ga-input-type-autocomplete',
  templateUrl: './input-type-autocomplete.component.html',
  styleUrls: ['./input-type-autocomplete.component.scss']
})
export class InputTypeAutocompleteComponent implements OnInit {
  groupBy = '';
  multiple: boolean;
  placeholder: any = '';
  defaultPlaceholder = 'Lựa chọn';
  options: Array<any> = [];
  bindValue = 'id';
  bindLabel = 'value';
  readOnly = false;

  typeahead = new Subject<string>();
  _formControlInput: FormControl = new FormControl();
  api: any;// suport api search

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

    this.placeholder = data.placeholder ? data.placeholder : this.defaultPlaceholder;

    if (data.typeahead) {
      this.typeahead = data.typeahead;
    }

    if (data.bindValue) {
      this.bindValue = data.bindValue;
    }

    if (data.bindLabel) {
      this.bindLabel = data.bindLabel;
    }

    if (data.options) {
      this.options = data.options;
    }
    if (data.multiple) {
      this.multiple = data.multiple;
    }
    if (data.groupBy) {
      this.groupBy = data.groupBy;
    }
    if (data.api) {
      this.api = data.api;
    }

    if (data.readOnly) {
      this.readOnly = data.readOnly;
    }

  }

  constructor(private config: NgSelectConfig) {
    this.config.notFoundText = 'Custom not found';
  }

  ngOnInit() {
    this.formControlInput.valueChanges.subscribe(rs => console.log(rs));
    if (this.api) {
      this.typeahead.pipe(
        debounceTime(200),
        switchMap(keyword => this.api(keyword))
      ).subscribe((res: any) => {
        console.log(res);
        this.options = res;
      });
      this.typeahead.next(' ');
    }
  }

}
