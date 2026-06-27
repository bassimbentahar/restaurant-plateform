import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Automations } from './automations';

describe('Automations', () => {
  let component: Automations;
  let fixture: ComponentFixture<Automations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Automations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Automations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
