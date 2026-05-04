import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutAddressModal } from './checkout-address-modal';

describe('CheckoutAddressModal', () => {
  let component: CheckoutAddressModal;
  let fixture: ComponentFixture<CheckoutAddressModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutAddressModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutAddressModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
