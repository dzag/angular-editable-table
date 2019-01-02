import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageableComponent } from './pageable.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrependZeroPipe } from './prepend-zero.pipe';
import { TableMetadataComponent } from './table-metadata.component';
import { TablePaginatorComponent } from './table-paginator.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    PageableComponent,
    TableMetadataComponent,
    TablePaginatorComponent,
    PrependZeroPipe,
  ],
  exports: [
    PageableComponent,
    TableMetadataComponent,
    TablePaginatorComponent,
  ]
})
export class PaginatorModule { }
