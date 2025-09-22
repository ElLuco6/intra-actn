import { TestBed } from '@angular/core/testing';

import { LogClientService } from './log-client.service';

describe('LogClientService', () => {
  let service: LogClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
