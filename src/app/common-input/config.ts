import { InputTypeSelectComponent } from './input-type-select/input-type-select.component';
import { InputTypeTextComponent } from './input-type-text/input-type-text.component';
import { InputTypeDateComponent } from './input-type-date/input-type-date.component';
import { InputTypeAutocompleteComponent } from './input-type-autocomplete/input-type-autocomplete.component';
import { InputTypeTextareaComponent } from './input-type-textarea/input-type-textarea.component';
import { InputTypeNumberComponent } from './input-type-number/input-type-number.component';
import { InputTypeCheckboxComponent } from './input-type-checkbox/input-type-checkbox.component';
import { Type } from '@angular/core';

export function getComponentFromType (type: string): Type<any> {
  let component;
  switch (type) {
    case 'select':
      component = InputTypeSelectComponent;
      break;
    case 'date':
      component = InputTypeDateComponent;
      break;
    case 'autocomplete':
      component = InputTypeAutocompleteComponent;
      break;
    case 'textarea':
      component = InputTypeTextareaComponent;
      break;
    case 'currency':
    case 'number':
      component = InputTypeNumberComponent;
      break;
    case 'checkbox':
      component = InputTypeCheckboxComponent;
      break;
    default:
      component = InputTypeTextComponent;
      break;
  }

  return component;
}
