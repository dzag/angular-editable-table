import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleTableExampleComponent } from './simple-table-example.component';

describe('SimpleTableExampleComponent', () => {
  let component: SimpleTableExampleComponent;
  let fixture: ComponentFixture<SimpleTableExampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleTableExampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleTableExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
