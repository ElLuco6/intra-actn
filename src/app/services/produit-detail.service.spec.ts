import { TestBed } from '@angular/core/testing';

import { ProduitDetailService } from './produit-detail.service';

describe('ProduitDetailService', () => {
  let service: ProduitDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProduitDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
