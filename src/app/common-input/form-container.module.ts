import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTypeTextComponent } from './input-type-text/input-type-text.component';
import { InputTypeSelectComponent } from './input-type-select/input-type-select.component';
import { CommonInputComponent } from './common-input.component';
import { InputTypeDateComponent } from './input-type-date/input-type-date.component';
import { InputTypeAutocompleteComponent } from './input-type-autocomplete/input-type-autocomplete.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { InputTypeTextareaComponent } from './input-type-textarea/input-type-textarea.component';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap';
import { InputTypeNumberComponent } from './input-type-number/input-type-number.component';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { vnViLocale } from './locales/vn-vi';
import { RequireInputFileComponent } from './require-input-file/require-input-file.component';
import { InputTypeCheckboxComponent } from './input-type-checkbox/input-type-checkbox.component';
defineLocale('vi', vnViLocale);

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NgSelectModule,
        BsDatepickerModule.forRoot()
    ],
    exports: [
        ReactiveFormsModule,
        CommonInputComponent,
        RequireInputFileComponent
    ],
    declarations: [
        CommonInputComponent,
        InputTypeTextComponent,
        InputTypeSelectComponent,
        InputTypeDateComponent,
        InputTypeAutocompleteComponent,
        InputTypeTextareaComponent,
        InputTypeNumberComponent,
        RequireInputFileComponent,
        InputTypeCheckboxComponent
    ],
    entryComponents: [
        InputTypeTextComponent,
        InputTypeSelectComponent,
        InputTypeDateComponent,
        InputTypeAutocompleteComponent,
        InputTypeTextareaComponent,
        InputTypeNumberComponent,
        InputTypeCheckboxComponent
    ],
})
export class FormContainerModule {

  constructor (localService: BsLocaleService) {
      localService.use('vi');
  }

}
