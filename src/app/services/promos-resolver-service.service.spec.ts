import { TestBed } from '@angular/core/testing';

import { PromosResolverServiceService } from './promos-resolver-service.service';

describe('PromosResolverServiceService', () => {
  let service: PromosResolverServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PromosResolverServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
