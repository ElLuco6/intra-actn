import { TestBed } from '@angular/core/testing';

import { XlsFormatterService } from './xls-formatter.service';

describe('XlsFormatterService', () => {
  let service: XlsFormatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XlsFormatterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
