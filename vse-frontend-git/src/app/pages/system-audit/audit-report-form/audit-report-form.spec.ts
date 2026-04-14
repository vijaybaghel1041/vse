import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditReportForm } from './audit-report-form';

describe('AuditReportForm', () => {
  let component: AuditReportForm;
  let fixture: ComponentFixture<AuditReportForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditReportForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditReportForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
