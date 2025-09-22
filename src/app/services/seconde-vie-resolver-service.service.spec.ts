import { TestBed } from '@angular/core/testing';

import { SecondeVieResolverService } from './seconde-vie-resolver-service.service';

describe('SecondeVieResolverServiceService', () => {
  let service: SecondeVieResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecondeVieResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
