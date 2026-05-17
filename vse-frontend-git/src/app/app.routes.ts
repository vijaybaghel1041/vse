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

export const routes: Routes = [

  // ✅ LANDING IS DEFAULT
  { path: '', component: Landing, pathMatch: 'full' },
  { path: 'market-qa', component: MarketQa },

  // 🔐 AUTH (NO NAVBAR)
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: Signup }
    ]
  },

  // 🔒 PROTECTED AREA
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'annual-submission', component: VseFormComponent },
      { path: 'member-submissions', component: AuditWorkflowComponent },
      { path: 'auditor', component: AuditorComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ❌ UNKNOWN URL → LANDING
  { path: '**', redirectTo: '' }
];
