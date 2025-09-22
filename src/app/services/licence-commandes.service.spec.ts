import { TestBed } from '@angular/core/testing';

import { LicenceCommandesService } from './licence-commandes.service';

describe('LicenceCommandesService', () => {
  let service: LicenceCommandesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LicenceCommandesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
