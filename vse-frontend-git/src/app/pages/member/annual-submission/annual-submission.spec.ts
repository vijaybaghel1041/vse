import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualSubmission } from './annual-submission';

describe('AnnualSubmission', () => {
  let component: AnnualSubmission;
  let fixture: ComponentFixture<AnnualSubmission>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnualSubmission]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnualSubmission);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
