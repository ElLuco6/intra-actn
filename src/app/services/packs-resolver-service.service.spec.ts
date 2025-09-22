import { TestBed } from '@angular/core/testing';

import { PacksResolverServiceService } from './packs-resolver-service.service';

describe('PacksResolverServiceService', () => {
  let service: PacksResolverServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PacksResolverServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
