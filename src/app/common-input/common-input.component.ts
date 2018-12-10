import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  forwardRef,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Renderer2,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { AbstractControl, ControlContainer, ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputTypeBase } from './input-type.interface';
import { MESSAGE_VALIDATION, MESSAGE_VALIDATION_RULE } from './message.validation';
import { Subject } from 'rxjs';
import { getComponentFromType } from './config';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'common-input',
  templateUrl: './common-input.component.html',
  styleUrls: ['./common-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CommonInputComponent),
      multi: true
    }
  ]
})
export class CommonInputComponent implements OnInit, ControlValueAccessor, AfterViewInit, OnDestroy {

  // only have one type
  @ViewChild('inputElement', { read: ViewContainerRef }) entry: ViewContainerRef;
  @Input() @HostBinding('attr.type') type: any = 'text';

  @Input() formControl: AbstractControl;
  @Input() formControlName: string;

  @Input() label: string;
  @Input() labelClass = '';
  @Input() contentClass = '';

  @Input() typeahead = new Subject<string>();
  @Input() options: any;

  @Input() errorMessages: any;

  @Input()
  get data() {
    return this._data;
  }
  set data(data: any) {
    this._data = data;
    this.initDataForChild(data);
  }

  @Input()
  get value() {
    return this._value;
  }

  set value(val: any) {
    this._value = val;
    this.setComponentData('target', this._value);
  }

  @Input()
  get readOnly (): boolean {
    return this._readOnly;
  }

  set readOnly (value: boolean) {
    this._readOnly = !!value;
    this.setComponentData('readOnly', this._readOnly);
  }

  @Input()
  get placeholder (): string {
    return this._placeholder;
  }

  set placeholder (value: string) {
    this._placeholder = value || '';
    this.setComponentData('placeholder', this._placeholder);
  }

  @Input()
  get row (): number {
    return this._row;
  }

  set row (value: number) {
    this._row = value;
    this.setComponentData('row', this._row);
  }

  errorMsg = '';

  _onChange: any;
  _onTouched: any;

  private _value;
  private _readOnly = false;
  private _data: any = {};
  private _placeholder = '';
  private _row = 5;

  private componentRef: ComponentRef<any>;

  constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
    private resolver: ComponentFactoryResolver,
    @Optional() private controlContainer: ControlContainer,
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    if (this.controlContainer && this.formControlName) {
      this.formControl = this.controlContainer.control.get(this.formControlName);
    }
  }

  ngAfterViewInit(): void {
    this.createInputComponent(this.entry);
    if (this.formControl) {
      this.formControl.valueChanges.pipe(debounceTime(1000), untilDestroyed(this)).subscribe(val => {
        if (val && (typeof val != 'number') && !(val instanceof Date)) {
          this.formControl.setValue(val.trim(), { emitEvent: false });
        }
      });
    }
    this.changeDetector.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.entry) {
      this.entry.clear();
    }
    this.componentRef.destroy();
  }

  @HostListener('change')
  change($event) {
    if ($event && $event.target) {
      this._onChange($event.target.value);
    }
  }

  @HostListener('blur')
  blur() {
    this._onTouched();
  }

  writeValue(value: any): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'value', value);
  }

  // Allows Angular to register a function to call when the model changes.
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  // Allows Angular to register a function to call when the input has been touched.
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  // Allows Angular to disable the input.
  setDisabledState?(isDisabled: boolean): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }

  createInputComponent(entry) {
    entry.clear();
    const component = getComponentFromType(this.type);

    if (!component) {
      alert('error');
    }
    const factory = this.resolver.resolveComponentFactory(component);
    this.componentRef = entry.createComponent(factory);
    (<InputTypeBase<any>>this.componentRef.instance).formControlInput = this.formControl;
    this.initDataForChild(this.data);
  }

  initDataForChild(data: any) {
    if (this.componentRef && data) {
      data.placeholder = this.placeholder;
      data.value = this.value;
      data.readOnly = this.readOnly;
      data.typeahead = this.typeahead;
      data.row = this.row;
      (<InputTypeBase<any>>this.componentRef.instance).data = data;
    }
  }

  checkRequired() {
    if (!this.formControl) {
      return false;
    }
    const abstractControl = this.formControl;
    if (abstractControl.validator) {
      const validator = abstractControl.validator({} as AbstractControl);
      if (validator && validator.required) {
        return true;
      }
    }

    return false;
  }

  checkError() {
    if (!this.formControl) {
      return false;
    }
    const control = this.formControl;
    if (control.errors && (control.touched || control.dirty)) {
      // set active error
      this.errorMsg = this.getErrorMsg(control.errors);

      return true;
    }

    this.errorMsg = '';
    return false;
  }

  getErrorMsg(errors) {
    if (!this.formControl) {
      return false;
    }
    let rule;
    let msg = '';
    let nameControl = this.getNameControl();

    for (const key in errors) {
      if (errors[key]) {
        rule = key;
        break;
      }
    }
    // console.log(nameControl);

    if (this.errorMessages && this.errorMessages[rule]) {
      return this.errorMessages[rule];
    }

    if (this.errorMessages && this.errorMessages[nameControl] && this.errorMessages[nameControl][rule]) {
      return this.errorMessages[nameControl][rule];
    }

    if (MESSAGE_VALIDATION[nameControl] && MESSAGE_VALIDATION[nameControl][rule]) {
      return MESSAGE_VALIDATION[nameControl][rule];
    }

    // by rule
    if (MESSAGE_VALIDATION_RULE[rule]) {
      return MESSAGE_VALIDATION_RULE[rule];
    }
    return 'chưa định nghĩa msg: ' + nameControl + '|' + rule;
  }

  getNameControl() {
    if (this.formControlName) {
      return this.formControlName;
    }
    let controlName = null;
    let parent = this.formControl.parent;
    // only such parent, which is FormGroup, has a dictionary
    // with control-names as a key and a form-control as a value
    if (parent instanceof FormGroup) {
      for (const key of Object.keys(parent.controls)) {
        if (this.formControl === parent.controls[key]) {
          // both are same: control passed to Validator
          //  and this child - are the same references
          controlName = key;
          break;
        }
      }
    }
    // we either found a name or simply return null
    return controlName;
  }

  private setComponentData(target, value) {
    if (this.componentRef) {
      const newData = { ...this.componentRef.instance.data };
      newData[target] = value;
      this.componentRef.instance.data = newData;
    }
  }

}
