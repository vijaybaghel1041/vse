import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../../core/services/audit.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-appoint-auditor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appoint-auditor.html',
  styleUrls: ['./appoint-auditor.css']
})
export class AppointAuditorComponent implements OnInit {

  enabledMembers: any[] = [];
  myRecord: any | null = null;
  auditorUsername = '';
  assigning = false;

  username = '';

  constructor(private auditService: AuditService, private auth: AuthService) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || '';
    this.loadEnabled();
  }

  loadEnabled() {
    this.auditService.getEnabledMembers().subscribe({ next: (r) => {
      this.enabledMembers = r;
      // try to find record for current user by memberCode or emailId
      this.myRecord = this.enabledMembers.find((m: any) => m.memberCode === this.username || m.emailId === this.username) || null;
    }, error: () => { this.enabledMembers = []; } });
  }

  appoint() {
    if (!this.auditorUsername) { alert('Enter auditor username'); return; }
    if (!this.username) { alert('User not identified'); return; }
    if (!this.myRecord) { alert('You are not enabled for this audit cycle. Contact admin.'); return; }

    this.assigning = true;
    this.auditService.initiate(this.username, this.auditorUsername, 'manual_assign', 'Assigned by member').subscribe({
      next: () => {
        this.assigning = false;
        alert('✅ Auditor assigned successfully.');
        this.auditorUsername = '';
      },
      error: (err: any) => {
        this.assigning = false;
        const msg = err?.error?.message || err?.error || err?.message || 'Failed to assign auditor';
        alert('❌ ' + msg);
      }
    });
  }

}
