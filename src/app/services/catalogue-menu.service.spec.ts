import { TestBed } from '@angular/core/testing';

import { CatalogueMenuService } from './catalogue-menu.service';

describe('CatalogueMenuService', () => {
  let service: CatalogueMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatalogueMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
