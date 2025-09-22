import { TestBed } from '@angular/core/testing';

import { CotationService } from './cotation.service';

describe('CotationService', () => {
  let service: CotationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CotationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
