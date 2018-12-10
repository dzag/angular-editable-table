import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetExampleComponent } from './sheet-example.component';

describe('SheetExampleComponent', () => {
  let component: SheetExampleComponent;
  let fixture: ComponentFixture<SheetExampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SheetExampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SheetExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
