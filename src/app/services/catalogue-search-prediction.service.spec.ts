import { TestBed } from '@angular/core/testing';

import { CatalogueSearchPredictionService } from './catalogue-search-prediction.service';

describe('CatalogueSearchPredictionService', () => {
  let service: CatalogueSearchPredictionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatalogueSearchPredictionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
