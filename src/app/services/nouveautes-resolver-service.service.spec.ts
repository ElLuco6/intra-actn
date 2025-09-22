import { TestBed } from '@angular/core/testing';

import { NouveautesResolverServiceService } from './nouveautes-resolver-service.service';

describe('NouveautesResolverServiceService', () => {
  let service: NouveautesResolverServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NouveautesResolverServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
