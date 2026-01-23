import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaiementFacturesComponent } from './paiement-factures.component';

describe('PaiementFacturesComponent', () => {
  let component: PaiementFacturesComponent;
  let fixture: ComponentFixture<PaiementFacturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaiementFacturesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaiementFacturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
