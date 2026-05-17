import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService, Audit } from '../../core/services/audit.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auditor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditor.component.html',
  styleUrls: ['./auditor.component.css']
})
export class AuditorComponent implements OnInit {

  myAudits: Audit[] = [];
  selectedAudit: Audit | null = null;
  auditorComment = '';
  reportFileName = '';
  username = '';

  constructor(
    private auditService: AuditService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.username = localStorage.getItem('username') || 'auditor1';
    this.loadAudits();
  }

  loadAudits() {
    this.auditService.getAuditorAudits(this.username).subscribe({
      next: (res) => this.myAudits = res,
      error: () => {}
    });
  }

  get pendingAudits(): Audit[] {
    return this.myAudits.filter(a => a.status === 'PENDING_AUDITOR');
  }

  get reportedAudits(): Audit[] {
    return this.myAudits.filter(a => a.status === 'AUDITOR_REPORTED' || a.status === 'MEMBER_RESPONDED');
  }

  get completedAudits(): Audit[] {
    return this.myAudits.filter(a => a.status === 'APPROVED' || a.status === 'REJECTED');
  }

  selectAudit(audit: Audit) {
    this.selectedAudit = audit;
    this.auditorComment = '';
    this.reportFileName = '';
  }

  onReportFile(event: any) {
    const file = event.target.files[0];
    if (file) this.reportFileName = file.name;
  }

  submitReport() {
    if (!this.selectedAudit?.id || !this.auditorComment) return;
    this.auditService.submitAuditorReport(this.selectedAudit.id, this.reportFileName || 'verbal_report').subscribe({
      next: () => {
        setTimeout(() => alert('✅ Audit report submitted successfully!'), 0);
        this.selectedAudit = null;
        this.loadAudits();
      },
      error: () => alert('Failed to submit. Please try again.')
    });
  }

  formatStatus(status: string): string {
    const map: any = {
      'INITIATED': 'Initiated',
      'PENDING_AUDITOR': 'Awaiting Verification',
      'AUDITOR_REPORTED': 'Report Filed',
      'MEMBER_RESPONDED': 'Member Responded',
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
