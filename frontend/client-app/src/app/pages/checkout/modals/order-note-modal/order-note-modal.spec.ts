import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderNoteModal } from './order-note-modal';

describe('OrderNoteModal', () => {
  let component: OrderNoteModal;
  let fixture: ComponentFixture<OrderNoteModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderNoteModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderNoteModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
