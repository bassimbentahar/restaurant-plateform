import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDetailsModal } from './customer-details-modal';

describe('CustomerDetailsModal', () => {
  let component: CustomerDetailsModal;
  let fixture: ComponentFixture<CustomerDetailsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDetailsModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerDetailsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
