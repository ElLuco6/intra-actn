import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitPreviewComponent } from './produit-preview.component';

describe('ProduitPreviewComponent', () => {
  let component: ProduitPreviewComponent;
  let fixture: ComponentFixture<ProduitPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProduitPreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
