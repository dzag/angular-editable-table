import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SimpleTableExampleComponent } from './examples/simple-table-example/simple-table-example.component';
import { SheetExampleComponent } from './examples/sheet-example/sheet-example.component';

@NgModule({
  imports: [RouterModule.forRoot([
    {
      path: '',
      children: [
        {
          path: '',
          redirectTo: 'sheet',
          pathMatch: 'full',
        },
        {
          path: 'sheet',
          component: SheetExampleComponent
        },
        {
          path: 'simple',
          component: SimpleTableExampleComponent,
        }
      ]
    }
  ])],
  exports: [RouterModule]
})
export class AppRoutingModule {}
