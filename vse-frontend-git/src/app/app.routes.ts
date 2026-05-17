import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

import { LoginComponent } from './pages/login/login.component';
import { Signup } from './pages/signup/signup';
import { Landing } from './pages/landing/landing';
import { MarketQa } from './pages/market-qa/market-qa';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VseFormComponent } from './pages/vse-form/vse-form.component';

import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

import { AuditorComponent } from './pages/auditor/auditor.component';
import { AuditWorkflowComponent } from './pages/audit-workflow/audit-workflow';
import { SubmissionReport } from './pages/admin/submission-report/submission-report';

export const routes: Routes = [

  // 🌐 PUBLIC
  { path: '', component: Landing, pathMatch: 'full' },
  { path: 'market-qa', component: MarketQa },

  // 🔐 AUTH LAYOUT (no sidebar/navbar)
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: Signup }
    ]
  },

  // 🔒 PROTECTED AREA (with sidebar + navbar)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Common
      { path: 'dashboard',          component: DashboardComponent },
      { path: 'annual-submission',  component: VseFormComponent },

      // Admin Routes
      { path: 'admin/members',      component: SubmissionReport },
      { path: 'admin/audits',       component: AuditWorkflowComponent },
      { path: 'admin/reports',      component: SubmissionReport },

      // Member Routes
      { path: 'member/initiate',    component: AuditWorkflowComponent },
      { path: 'member/history',     component: AuditWorkflowComponent },
      { path: 'member-submissions', component: AuditWorkflowComponent },

      // Auditor Routes
      { path: 'auditor/queue',      component: AuditorComponent },
      { path: 'auditor/completed',  component: AuditorComponent },
      { path: 'auditor',            component: AuditorComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '' }
];
