import { TestBed } from '@angular/core/testing';

import { ServerWindowService } from './server-window.service';

describe('ServerWindowService', () => {
  let service: ServerWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServerWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
