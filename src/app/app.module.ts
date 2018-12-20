import { BrowserModule, EventManager } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SheetExampleComponent } from './examples/sheet-example/sheet-example.component';
import { AppRoutingModule } from './app-routing.module';
import { FormContainerModule } from './common-input/form-container.module';
import { NgTableModule } from './table';
import { CustomEventManager } from './custom-event-manager';

@NgModule({
  declarations: [
    AppComponent,
    SheetExampleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormContainerModule,
    NgTableModule,
  ],
  providers: [
    { provide: EventManager, useClass: CustomEventManager }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
