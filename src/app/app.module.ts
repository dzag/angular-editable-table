import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SheetExampleComponent } from './examples/sheet-example/sheet-example.component';
import { AppRoutingModule } from './app-routing.module';
import { FormContainerModule } from './common-input/form-container.module';

@NgModule({
  declarations: [
    AppComponent,
    SheetExampleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormContainerModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
