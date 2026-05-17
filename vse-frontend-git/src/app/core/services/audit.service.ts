import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Audit {
  id?: number;
  memberUsername: string;
  auditorUsername: string;
  status: string;
  companyName?: string;
  auditPeriod?: string;
  initialExcelFile?: string;
  auditorReportFile?: string;
  memberFinalResponseFile?: string;
  adminComments?: string;
  auditorComment?: string;
  auditDescription?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  private api = 'http://localhost:8080/api/audit';

  constructor(private http: HttpClient) {}

  initiate(member: string, auditor: string, excelName: string, description: string): Observable<Audit> {
    return this.http.post<Audit>(`${this.api}/initiate`, { member, auditor, excelName, description });
  }

  submitAuditorReport(auditId: number, reportName: string): Observable<Audit> {
    return this.http.post<Audit>(`${this.api}/${auditId}/submit-report`, { reportName });
  }

  submitMemberResponse(auditId: number, responseFile: string): Observable<Audit> {
    return this.http.post<Audit>(`${this.api}/${auditId}/member-response`, { responseFile });
  }

  adminDecision(auditId: number, decision: 'APPROVED' | 'REJECTED', comments: string): Observable<Audit> {
    return this.http.post<Audit>(`${this.api}/${auditId}/admin-decision`, { decision, comments });
  }

  getMemberAudits(username: string): Observable<Audit[]> {
    return this.http.get<Audit[]>(`${this.api}/member/${username}`);
  }

  getAuditorAudits(username: string): Observable<Audit[]> {
    return this.http.get<Audit[]>(`${this.api}/auditor/${username}`);
  }

  getAllAudits(): Observable<Audit[]> {
    return this.http.get<Audit[]>(`${this.api}/admin/all`);
  }

  enableMembers(members: any[]): Observable<any[]> {
    return this.http.post<any[]>(`http://localhost:8080/api/admin/members/enable-bulk`, members);
  }

  getEnabledMembers(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/admin/members/enabled-all`);
  }
}
