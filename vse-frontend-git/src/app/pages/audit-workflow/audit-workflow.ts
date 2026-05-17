import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService, Audit } from '../../core/services/audit.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-audit-workflow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-workflow.html',
  styleUrls: ['./audit-workflow.css']
})
export class AuditWorkflowComponent implements OnInit {

  role: string | null = '';
  username: string | null = '';

  audits: Audit[] = [];
  selectedAudit: Audit | null = null;

  // UI State
  showInitiateForm = false;

  // Member - Initiate
  assignedAuditor = '';
  excelFileName = '';
  auditDescription = '';

  // Member - Response
  memberComment = '';

  // Admin - Decision
  adminComments = '';

  constructor(
    private auditService: AuditService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.role = this.authService.getUserRole();
    this.username = localStorage.getItem('username') || (this.role === 'ADMIN' ? 'admin' : 'member1');
    this.loadAudits();
  }

  loadAudits() {
    if (this.role === 'ADMIN') {
      this.auditService.getAllAudits().subscribe({ next: (r) => this.audits = r, error: () => {} });
    } else if (this.role === 'AUDITOR') {
      this.auditService.getAuditorAudits(this.username!).subscribe({ next: (r) => this.audits = r, error: () => {} });
    } else {
      this.auditService.getMemberAudits(this.username!).subscribe({ next: (r) => this.audits = r, error: () => {} });
    }
  }

  selectAudit(audit: Audit) {
    this.selectedAudit = audit;
    this.showInitiateForm = false;
  }

  // ──── Getters ────

  get pendingApprovalCount(): number {
    return this.audits.filter(a => a.status === 'MEMBER_RESPONDED').length;
  }

  get approvedCount(): number {
    return this.audits.filter(a => a.status === 'APPROVED').length;
  }

  get awaitingResponseCount(): number {
    return this.audits.filter(a => a.status === 'AUDITOR_REPORTED').length;
  }

  // ──── Member Actions ────

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.excelFileName = file.name;
  }

  initiateAudit() {
    if (!this.assignedAuditor) { alert('Please enter auditor username.'); return; }
    this.auditService.initiate(this.username!, this.assignedAuditor, this.excelFileName, this.auditDescription)
      .subscribe({
        next: () => {
          setTimeout(() => alert('✅ Audit initiated successfully!'), 0);
          this.showInitiateForm = false;
          this.assignedAuditor = '';
          this.excelFileName = '';
          this.auditDescription = '';
          this.loadAudits();
        },
        error: () => alert('Failed to initiate audit. Please try again.')
      });
  }

  submitMemberResponse() {
    if (!this.selectedAudit?.id) return;
    this.auditService.submitMemberResponse(this.selectedAudit.id, this.memberComment)
      .subscribe({
        next: () => {
          setTimeout(() => alert('✅ Response submitted to Admin for approval!'), 0);
          this.selectedAudit = null;
          this.memberComment = '';
          this.loadAudits();
        },
        error: () => alert('Submission failed. Please try again.')
      });
  }

  // ──── Admin Actions ────

  adminDecision(decision: 'APPROVED' | 'REJECTED') {
    if (!this.selectedAudit?.id) return;
    this.auditService.adminDecision(this.selectedAudit.id, decision, this.adminComments)
      .subscribe({
        next: () => {
          setTimeout(() => alert(`✅ Audit ${decision} by Administrative Board`), 0);
          this.selectedAudit = null;
          this.adminComments = '';
          this.loadAudits();
        },
        error: () => alert('Decision failed. Please try again.')
      });
  }

  // ──── Workflow Step Classes (for MEMBER) ────

  getStepClass(step: number): string {
    if (!this.selectedAudit) return '';
    const statusOrder = ['INITIATED', 'PENDING_AUDITOR', 'AUDITOR_REPORTED', 'MEMBER_RESPONDED', 'APPROVED'];
    const currentIdx = statusOrder.indexOf(this.selectedAudit.status);
    if (currentIdx + 1 > step) return 'done';
    if (currentIdx + 1 === step) return 'active';
    return '';
  }

  getStepLineClass(step: number): string {
    if (!this.selectedAudit) return '';
    const statusOrder = ['INITIATED', 'PENDING_AUDITOR', 'AUDITOR_REPORTED', 'MEMBER_RESPONDED', 'APPROVED'];
    const currentIdx = statusOrder.indexOf(this.selectedAudit.status);
    return currentIdx >= step ? 'done' : '';
  }

  // ──── Formatting ────

  formatStatus(status: string): string {
    const map: any = {
      'INITIATED': 'Initiated',
      'PENDING_AUDITOR': 'Awaiting Auditor',
      'AUDITOR_REPORTED': 'Report Filed',
      'MEMBER_RESPONDED': 'Pending Approval',
      'APPROVED': 'Approved ✓',
      'REJECTED': 'Rejected ✗'
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: any = {
      'INITIATED': 'status-initiated',
      'PENDING_AUDITOR': 'status-pending',
      'AUDITOR_REPORTED': 'status-reported',
      'MEMBER_RESPONDED': 'status-responded',
      'APPROVED': 'status-approved',
      'REJECTED': 'status-rejected'
    };
    return map[status] || 'status-pending';
  }
}
