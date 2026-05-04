import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryTimeModal } from './delivery-time-modal';

describe('DeliveryTimeModal', () => {
  let component: DeliveryTimeModal;
  let fixture: ComponentFixture<DeliveryTimeModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryTimeModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryTimeModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
