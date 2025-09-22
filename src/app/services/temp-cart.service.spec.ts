import { TestBed } from '@angular/core/testing';

import { TempCartService } from './temp-cart.service';

describe('TempCartService', () => {
  let service: TempCartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TempCartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
