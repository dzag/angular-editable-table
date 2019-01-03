import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormContainerModule } from '../common-input/form-container.module';
import { NgTableComponent } from './ng-table.component';
import { DateToStringPipe, StringToDatePipe } from './core/pipes/date-pipes';
import { VndCurrencyPipe } from './core/pipes/vnd-currency.pipe';
import { PrependZeroPipe } from './core/pipes/prepend-zero.pipe';
import { TableCellComponent } from './core/table-cell/table-cell.component';
import { StopPropagationDirective } from './stop-propagation.directive';
import { RouterModule } from '@angular/router';
import { TableHeaderComponent } from './core/table-header/table-header.component';
import { TableCellForAddingComponent } from './core/table-cell-for-adding/table-cell-for-adding.component';
import { AddingRowComponent } from './core/adding-row/adding-row.component';
import { PaginatorModule } from '../paginator/paginator.module';
import { TableRowComponent } from './core/table-row/table-row.component';
import { DataOnlyCellComponent } from './core/cells/data-only-cell/data-only-cell.component';
import { TableGroupHeaderComponent } from './core/table-group-header/table-group-header.component';

const PIPES = [
  DateToStringPipe,
  StringToDatePipe,
  VndCurrencyPipe,
  PrependZeroPipe,
];

const DIRECTIVES = [
  StopPropagationDirective,
];

const TABLE_CORE = [
  TableCellComponent,
  TableCellForAddingComponent,
  AddingRowComponent,
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
    TableRowComponent,
    DataOnlyCellComponent,
    TableGroupHeaderComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormContainerModule,
    PaginatorModule,
  ],
  exports: [
    NgTableComponent,
  ]
})
export class NgTableModule {}
