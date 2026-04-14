import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VseForm } from './vse-form.component';

describe('VseForm', () => {
  let component: VseForm;
  let fixture: ComponentFixture<VseForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VseForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VseForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
