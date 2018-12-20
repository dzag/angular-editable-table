import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormContainerModule } from '../common-input/form-container.module';
import { NgTableComponent } from './ng-table.component';
import { DateToStringPipe, StringToDatePipe } from './core/pipes/date-pipes';
import { VndCurrencyPipe } from './core/pipes/vnd-currency.pipe';
import { PrependZeroPipe } from './core/pipes/prepend-zero.pipe';
import { TableCellComponent } from './core/table-cell/table-cell.component';
import { TableMetadataComponent } from './paginator/table-metadata.component';
import { TablePaginationComponent } from './paginator/table-pagination.component';
import { StopPropagationDirective } from './stop-propagation.directive';
import { RouterModule } from '@angular/router';
import { TableHeaderComponent } from './core/table-header/table-header.component';

const PIPES = [
  DateToStringPipe,
  StringToDatePipe,
  VndCurrencyPipe,
  PrependZeroPipe,
];

const DIRECTIVES = [
  StopPropagationDirective,
];

const PAGINATOR = [
  TableMetadataComponent,
  TablePaginationComponent,
];

const TABLE_CORE = [
  TableCellComponent,
  TableHeaderComponent,
];

const TABLE_IMPLEMENTS = [
];

@NgModule({
  declarations: [
    NgTableComponent,
    ...TABLE_CORE,
    ...TABLE_IMPLEMENTS,
    ...PIPES,
    ...DIRECTIVES,
    ...PAGINATOR
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormContainerModule,
  ],
  exports: [
    NgTableComponent,
  ]
})
export class NgTableModule {}
