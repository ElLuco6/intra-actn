import { TestBed } from '@angular/core/testing';

import { UrlCheckerService } from './url-checker.service';

describe('UrlCheckerService', () => {
  let service: UrlCheckerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UrlCheckerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
