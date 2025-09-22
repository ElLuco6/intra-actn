import { TestBed } from '@angular/core/testing';

import { ExportToXslService } from './export-to-xsl.service';

describe('ExportToXslService', () => {
  let service: ExportToXslService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportToXslService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
