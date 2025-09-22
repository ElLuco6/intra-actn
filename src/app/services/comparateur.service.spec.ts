import { TestBed } from '@angular/core/testing';

import { ComparateurService } from './comparateur.service';

describe('ComparateurService', () => {
  let service: ComparateurService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComparateurService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
