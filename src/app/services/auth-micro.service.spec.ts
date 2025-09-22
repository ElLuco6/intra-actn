import { TestBed } from '@angular/core/testing';

import { AuthMicroService } from './auth-micro.service';

describe('AuthMicroService', () => {
  let service: AuthMicroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthMicroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
