import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService, Audit } from '../../core/services/audit.service';
import { AuthService } from '../../core/services/auth.service';
import * as XLSX from 'xlsx';

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
  enabledMembers: any[] = [];

  // Admin Excel Upload
  uploading = false;
  excelDataLine = 'M1001,APR-26 TO MAR-27,contact@member.com';
  auditDescription = '';
  assignedAuditor = '';
  excelFileName = '';
  excelFile: any = null;
  reportFileName = '';
  responseFileName = '';
  adminDecisionValue: 'APPROVED' | 'REJECTED' = 'APPROVED';
  adminComments = '';
  auditorComment = '';
  memberComment = '';

  constructor(
    private auditService: AuditService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.role = this.authService.getUserRole();
    this.username = localStorage.getItem('username') || (this.role === 'ADMIN' ? 'Admin' : 'Member1');
    this.loadAudits();
    if (this.role === 'ADMIN') this.loadEnabledMembers();
  }

  loadEnabledMembers() {
    this.auditService.getEnabledMembers().subscribe(res => this.enabledMembers = res);
  }

  onFileSelected(event: any, role?: string) {
    const file = event.target.files[0];
    if (file) {
      if (role === 'Member') {
        this.responseFileName = file.name;
      } else if (role === 'Auditor') {
        this.reportFileName = file.name;
      } else {
        this.excelFileName = file.name;
        this.excelFile = file;
      }
    }
  }

  uploadExcel() {
    this.uploading = true;
    const parts = this.excelDataLine.split(',');
    const payload = [{
      memberCode: parts[0],
      auditPeriod: parts[1],
      emailId: parts[2]
    }];
    
    this.auditService.enableMembers(payload).subscribe(res => {
      this.enabledMembers = res;
      this.uploading = false;
      alert('Member Enabled and Data Saved to DB!');
    });
  }

  addAuditor() {
    alert('Redirecting to Auditor Appointment & Registration...');
  }

  loadAudits() {
    if (this.role === 'ADMIN') {
      this.auditService.getAllAudits().subscribe(res => this.audits = res);
    } else if (this.role === 'AUDITOR') {
      this.auditService.getAuditorAudits(this.username!).subscribe(res => this.audits = res);
    } else {
      this.auditService.getMemberAudits(this.username!).subscribe(res => this.audits = res);
    }
  }

  // --- ACTIONS ---

  initiateAudit() {
    this.auditService.initiate(this.username!, this.assignedAuditor, this.excelFileName, this.auditDescription)
      .subscribe(() => {
        alert('Audit Initiated & Excel Uploaded!');
        this.loadAudits();
        this.resetForms();
      });
  }

  submitAuditorReport() {
    if (!this.selectedAudit?.id) return;
    this.auditService.submitAuditorReport(this.selectedAudit.id, this.reportFileName)
      .subscribe(() => {
        alert('Auditor Report Submitted Successfully!');
        this.loadAudits();
        this.selectedAudit = null;
      });
  }

  submitMemberResponse() {
    if (!this.selectedAudit?.id) return;
    this.auditService.submitMemberResponse(this.selectedAudit.id, this.responseFileName)
      .subscribe(() => {
        alert('Final Response Uploaded & Sent to Admin!');
        this.loadAudits();
        this.selectedAudit = null;
      });
  }

  adminDecision(decision: 'APPROVED' | 'REJECTED') {
    if (!this.selectedAudit?.id) return;
    this.auditService.adminDecision(this.selectedAudit.id, decision, this.adminComments)
      .subscribe(() => {
        alert(`Audit ${decision} by Administrative Board`);
        this.loadAudits();
        this.selectedAudit = null;
      });
  }

  selectAudit(audit: Audit) {
    this.selectedAudit = audit;
  }

  resetForms() {
    this.auditDescription = '';
    this.assignedAuditor = '';
    this.excelFileName = '';
  }
}
