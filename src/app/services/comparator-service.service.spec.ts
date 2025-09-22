import { TestBed } from '@angular/core/testing';

import { ComparatorServiceService } from './comparator-service.service';

describe('ComparatorServiceService', () => {
  let service: ComparatorServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComparatorServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
