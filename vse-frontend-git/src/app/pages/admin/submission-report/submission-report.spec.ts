import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionReport } from './submission-report';

describe('SubmissionReport', () => {
  let component: SubmissionReport;
  let fixture: ComponentFixture<SubmissionReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmissionReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
