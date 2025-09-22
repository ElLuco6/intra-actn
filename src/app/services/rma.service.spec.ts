import { TestBed } from '@angular/core/testing';

import { RmaService } from './rma.service';

describe('RmaService', () => {
  let service: RmaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RmaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
