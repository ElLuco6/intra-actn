import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeRapideComponent } from './commande-rapide.component';

describe('CommandeRapideComponent', () => {
  let component: CommandeRapideComponent;
  let fixture: ComponentFixture<CommandeRapideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommandeRapideComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandeRapideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
