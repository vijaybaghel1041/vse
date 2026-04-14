import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignAuditor } from './assign-auditor';

describe('AssignAuditor', () => {
  let component: AssignAuditor;
  let fixture: ComponentFixture<AssignAuditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignAuditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignAuditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
