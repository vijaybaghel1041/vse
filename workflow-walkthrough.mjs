import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:4200';
const EXCEL = path.join(__dirname, 'financial_report.xlsx');
const PDF = path.join(__dirname, 'audit_observations.pdf');
const SHOT = path.join(__dirname, 'dashboard-approved.png');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForMemberEnabled(code = 'member1') {
  for (let i = 0; i < 30; i++) {
    const res = await fetch('http://localhost:8080/api/admin/members/enabled-all');
    const members = await res.json();
    if (members.some((m) => m.memberCode === code && m.submissionStatus === 'NOT_STARTED')) return;
    await sleep(1000);
  }
  throw new Error(`${code} not enabled with NOT_STARTED`);
}

async function waitForAuditStatus(member, status) {
  for (let i = 0; i < 30; i++) {
    const res = await fetch(`http://localhost:8080/api/audit/member/${member}`);
    const audits = await res.json();
    if (audits.some((a) => a.status === status)) return audits.find((a) => a.status === status);
    await sleep(1000);
  }
  throw new Error(`No audit for ${member} in status ${status}`);
}

async function login(page, user, pass) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.getByPlaceholder('e.g. admin').fill(user);
  await page.getByPlaceholder('••••••••').fill(pass);
  await page.evaluate((u) => localStorage.setItem('username', u), user);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
}

async function logout(page) {
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await page.waitForURL('**/login**', { timeout: 10000 });
}

function acceptDialogs(page) {
  page.on('dialog', (d) => d.accept());
}

async function waitForText(page, text, timeout = 20000) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  acceptDialogs(page);
  const log = (phase, msg) => console.log(`[${phase}] ${msg}`);

  try {
    for (let i = 0; i < 60; i++) {
      try {
        const r = await fetch('http://localhost:8080/actuator/health');
        if (r.ok) break;
      } catch { /* retry */ }
      await sleep(2000);
    }

    // PHASE 1
    log('P1', 'Admin login');
    await login(page, 'admin', 'admin123');
    await page.goto(`${BASE}/admin/members`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: '✏️ Manual Entry' }).click();
    await page.getByPlaceholder('e.g. M1001').fill('member1');
    await page.getByPlaceholder('e.g. APR-26 TO MAR-27').fill('FY 2025-26');
    await page.getByPlaceholder('e.g. member@company.com').fill('member1@vse.com');
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('enable-bulk') && r.status() === 200),
      page.getByRole('button', { name: '✅ Enable Member' }).click(),
    ]);
    await waitForMemberEnabled('member1');
    log('P1', 'member1 enabled with NOT_STARTED');
    await logout(page);

    // PHASE 2
    log('P2', 'Member initiate audit');
    await login(page, 'member1', 'member123');
    await page.goto(`${BASE}/member/initiate`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: '+ Initiate New Audit' }).click();
    await page.getByPlaceholder('e.g. auditor1').fill('auditor1');
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('.file-drop-zone').first().click(),
    ]);
    await chooser.setFiles(EXCEL);
    await page.getByText('financial_report.xlsx').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('textarea').fill(
      'Annual Financial Audit for FY 2025-26. Please verify all ledger entries.'
    );
    await page.getByRole('button', { name: 'Submit Audit Request' }).click();
    const initResp = await page.waitForResponse(
      (r) => r.url().includes('/api/audit/initiate'),
      { timeout: 30000 }
    );
    log('P2', `initiate status ${initResp.status()}`);
    if (initResp.status() !== 200) throw new Error(`initiate failed: ${initResp.status()}`);
    await waitForAuditStatus('member1', 'PENDING_AUDITOR');
    log('P2', 'Audit PENDING_AUDITOR');
    await logout(page);

    // PHASE 3
    log('P3', 'Auditor verification');
    await login(page, 'auditor1', 'auditor123');
    const auditorLoad = page.waitForResponse(
      (r) => r.url().includes('/api/audit/auditor/auditor1') && r.status() === 200
    );
    await page.goto(`${BASE}/auditor/queue`, { waitUntil: 'networkidle' });
    await auditorLoad;
    await page.locator('.verify-card').filter({ hasText: 'member1' }).first().click();
    await page.locator('textarea.audit-textarea').fill(
      'All financial records and ledger entries have been reviewed. The numbers align perfectly with the source documents. Recommended for final approval.'
    );
    const [pdfChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('.file-drop-zone').first().click(),
    ]);
    await pdfChooser.setFiles(PDF);
    await page.getByRole('button', { name: 'Submit Audit Report →' }).click();
    await waitForAuditStatus('member1', 'AUDITOR_REPORTED');
    log('P3', 'Auditor report submitted — AUDITOR_REPORTED');
    await logout(page);

    // PHASE 4
    log('P4', 'Member response');
    await login(page, 'member1', 'member123');
    const memberLoad = page.waitForResponse(
      (r) => r.url().includes('/api/audit/member/member1') && r.status() === 200
    );
    await page.goto(`${BASE}/member/initiate`, { waitUntil: 'networkidle' });
    await memberLoad;
    await page.locator('.verify-card').first().click();
    await page.locator('textarea.audit-textarea').fill(
      'Thank you for the verification. I accept all findings and submit for final administrative approval.'
    );
    await page.getByRole('button', { name: 'Submit Response to Admin →' }).click();
    await waitForAuditStatus('member1', 'MEMBER_RESPONDED');
    log('P4', 'Member responded — MEMBER_RESPONDED');
    await logout(page);

    // PHASE 5
    log('P5', 'Admin final approval');
    await login(page, 'admin', 'admin123');
    const adminLoad = page.waitForResponse(
      (r) => r.url().includes('/api/audit/admin/all') && r.status() === 200
    );
    await page.goto(`${BASE}/admin/audits`, { waitUntil: 'networkidle' });
    await adminLoad;
    await page.locator('.verify-card').filter({ hasText: 'member1' }).first().click();
    await page.locator('textarea.audit-textarea').fill(
      'The audit process is completed successfully. Final approval is granted.'
    );
    await page.getByRole('button', { name: '✓ Approve Audit' }).click();
    await waitForAuditStatus('member1', 'APPROVED');
    log('P5', 'Audit APPROVED');
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: SHOT, fullPage: true });
    log('P5', `Dashboard screenshot: ${SHOT}`);
    await logout(page);

    console.log('\n=== WORKFLOW COMPLETE ===');
  } catch (err) {
    console.error('WORKFLOW FAILED:', err.message);
    await page.screenshot({ path: path.join(__dirname, 'workflow-error.png'), fullPage: true });
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
