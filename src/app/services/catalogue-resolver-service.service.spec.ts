import { TestBed } from '@angular/core/testing';

import { CatalogueResolverServiceService } from './catalogue-resolver-service.service';

describe('CatalogueResolverServiceService', () => {
  let service: CatalogueResolverServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatalogueResolverServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
