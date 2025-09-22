import { TestBed } from '@angular/core/testing';

import { DestockageResolverService } from './destockage-resolver-service.service';

describe('DestockageResolverService', () => {
  let service: DestockageResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DestockageResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
