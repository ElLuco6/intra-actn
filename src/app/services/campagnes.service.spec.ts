import { TestBed } from '@angular/core/testing';

import { CampagnesService } from './campagnes.service';

describe('CampagnesService', () => {
  let service: CampagnesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CampagnesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
