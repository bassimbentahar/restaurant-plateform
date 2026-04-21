import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketPanel } from './basket-panel';

describe('BasketPanel', () => {
  let component: BasketPanel;
  let fixture: ComponentFixture<BasketPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasketPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasketPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
