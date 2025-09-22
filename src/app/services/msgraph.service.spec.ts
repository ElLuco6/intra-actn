import { TestBed } from '@angular/core/testing';

import { MsgraphService } from './msgraph.service';

describe('MsgraphService', () => {
  let service: MsgraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MsgraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
