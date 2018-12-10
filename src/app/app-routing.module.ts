import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SheetExampleComponent } from './examples/sheet-example/sheet-example.component';

@NgModule({
  imports: [RouterModule.forRoot([
    {
      path: '',
      children: [
        {
          path: 'sheet',
          component: SheetExampleComponent
        }
      ]
    }
  ])],
  exports: [RouterModule]
})
export class AppRoutingModule {}