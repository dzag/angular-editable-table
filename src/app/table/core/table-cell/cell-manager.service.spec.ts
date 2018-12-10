import { TestBed } from '@angular/core/testing';

import { CellManager } from './cell-manager.service';

describe('CellManager', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CellManager = TestBed.get(CellManager);
    expect(service).toBeTruthy();
  });
});
