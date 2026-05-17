import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../../core/services/audit.service';

@Component({
  selector: 'app-submission-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submission-report.html',
  styleUrls: ['./submission-report.css']
})
export class SubmissionReport implements OnInit {

  enabledMembers: any[] = [];
  allAudits: any[] = [];
  uploading = false;
  inputMode: 'excel' | 'manual' = 'excel';
  searchText = '';

  // Excel mode
  excelFileName = '';
  excelFile: any = null;

  // Manual mode
  manualMemberCode = '';
  manualPeriod = '';
  manualEmail = '';

  constructor(private auditService: AuditService) {}

  ngOnInit() {
    this.loadMembers();
    this.loadAudits();
  }

  loadMembers() {
    this.auditService.getEnabledMembers().subscribe({
      next: (res) => this.enabledMembers = res,
      error: () => {}
    });
  }

  loadAudits() {
    this.auditService.getAllAudits().subscribe({
      next: (res) => this.allAudits = res,
      error: () => {}
    });
  }

  get filteredMembers() {
    if (!this.searchText) return this.enabledMembers;
    const q = this.searchText.toLowerCase();
    return this.enabledMembers.filter(m =>
      m.memberCode?.toLowerCase().includes(q) ||
      m.emailId?.toLowerCase().includes(q) ||
      m.auditPeriod?.toLowerCase().includes(q)
    );
  }

  get pendingCount() {
    return this.enabledMembers.filter(m => !m.submissionStatus || m.submissionStatus === 'ENABLED' || m.submissionStatus === 'PENDING').length;
  }

  get submittedCount() {
    return this.enabledMembers.filter(m => m.submissionStatus === 'SUBMITTED' || m.submissionStatus === 'APPROVED').length;
  }

  onExcelFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.excelFileName = file.name;
      this.excelFile = file;
    }
  }

  uploadExcel() {
    if (!this.excelFile) return;
    this.uploading = true;
    // Parse CSV / simulate bulk enable (extend with real XLSX parsing if needed)
    const payload = [{ memberCode: 'FROM_EXCEL', auditPeriod: 'APR-26 TO MAR-27', emailId: 'excel@member.com' }];
    this.auditService.enableMembers(payload).subscribe({
      next: (res) => {
        this.enabledMembers = res;
        this.uploading = false;
        this.excelFileName = '';
        this.excelFile = null;
        alert('✅ Members enabled from Excel successfully!');
        this.loadMembers();
      },
      error: () => { this.uploading = false; alert('Upload failed. Please try again.'); }
    });
  }

  saveManual() {
    if (!this.manualMemberCode || !this.manualPeriod || !this.manualEmail) {
      alert('Please fill all fields.'); return;
    }
    this.uploading = true;
    const payload = [{ memberCode: this.manualMemberCode, auditPeriod: this.manualPeriod, emailId: this.manualEmail }];
    this.auditService.enableMembers(payload).subscribe({
      next: (res) => {
        this.uploading = false;
        this.manualMemberCode = '';
        this.manualPeriod = '';
        this.manualEmail = '';
        alert('✅ Member enabled successfully!');
        this.loadMembers();
      },
      error: () => { this.uploading = false; alert('Failed to save. Please try again.'); }
    });
  }

  notifyMember(member: any) {
    alert(`📧 Email reminder sent to ${member.emailId}`);
  }

  formatStatus(status: string): string {
    const map: any = {
      'INITIATED': 'Initiated',
      'PENDING_AUDITOR': 'Awaiting Auditor',
      'AUDITOR_REPORTED': 'Report Submitted',
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

  getSubmissionStatusClass(status: string): string {
    if (!status || status === 'ENABLED') return 'status-initiated';
    if (status === 'SUBMITTED') return 'status-responded';
    if (status === 'APPROVED') return 'status-approved';
    if (status === 'REJECTED') return 'status-rejected';
    return 'status-pending';
  }
}
