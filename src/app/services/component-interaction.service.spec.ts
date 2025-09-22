import { TestBed } from '@angular/core/testing';

import { ComponentsInteractionService } from './components-interaction.service';

describe('ComponentInteractionService', () => {
  let service: ComponentsInteractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComponentsInteractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
