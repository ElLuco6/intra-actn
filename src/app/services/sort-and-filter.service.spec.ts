import { TestBed } from '@angular/core/testing';

import { SortAndFilterService } from './sort-and-filter.service';

describe('SortAndFilterService', () => {
  let service: SortAndFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SortAndFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
