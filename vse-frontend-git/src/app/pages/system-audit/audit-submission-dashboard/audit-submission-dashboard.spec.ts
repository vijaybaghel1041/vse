import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditSubmissionDashboard } from './audit-submission-dashboard';

describe('AuditSubmissionDashboard', () => {
  let component: AuditSubmissionDashboard;
  let fixture: ComponentFixture<AuditSubmissionDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditSubmissionDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditSubmissionDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
