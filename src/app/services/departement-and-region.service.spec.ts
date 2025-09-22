import { TestBed } from '@angular/core/testing';

import { DepartementAndRegionService } from './departement-and-region.service';

describe('DepartementAndRegionService', () => {
  let service: DepartementAndRegionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepartementAndRegionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
