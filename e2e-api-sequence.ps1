try {
    Write-Output "STEP: Enable member testmember"
    $payload = @(@{memberCode='testmember'; auditPeriod='FY 2026-27'; emailId='testmember@vse.com'})
    $rEnable = Invoke-RestMethod -Uri 'http://localhost:8080/api/admin/members/enable-bulk' -Method Post -Body ($payload | ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
    Write-Output "ENABLED:"
    $rEnable | ConvertTo-Json | Write-Output

    Write-Output "STEP: Initiate audit"
    $body = @{member='testmember'; auditor='auditor1'; excelName='init.xlsx'}
    $init = Invoke-RestMethod -Uri 'http://localhost:8080/api/audit/initiate' -Method Post -Body ($body | ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
    Write-Output "INITIATED:"
    $init | ConvertTo-Json | Write-Output

    $id = $init.id
    if (-not $id) { Write-Output "ERROR: no id returned from initiate"; exit 1 }

    Write-Output "STEP: List audits (admin)"
    Invoke-RestMethod -Uri 'http://localhost:8080/api/audit/admin/all' -Method Get | ConvertTo-Json | Write-Output

    Write-Output "STEP: Auditor submits report"
    $rAuditSubmit = Invoke-RestMethod -Uri "http://localhost:8080/api/audit/$id/submit-report" -Method Post -Body (@{reportName='audit_report.pdf'} | ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
    Write-Output "AUDITOR_SUBMITTED:"
    $rAuditSubmit | ConvertTo-Json | Write-Output

    Write-Output "STEP: Member responds"
    $rMemberResp = Invoke-RestMethod -Uri "http://localhost:8080/api/audit/$id/member-response" -Method Post -Body (@{responseFile='member_final.pdf'} | ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
    Write-Output "MEMBER_RESPONDED:"
    $rMemberResp | ConvertTo-Json | Write-Output

    Write-Output "STEP: Admin decision (approve)"
    $rAdmin = Invoke-RestMethod -Uri "http://localhost:8080/api/audit/$id/admin-decision" -Method Post -Body (@{decision='APPROVED'; comments='Looks good'} | ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
    Write-Output "ADMIN_DECISION:"
    $rAdmin | ConvertTo-Json | Write-Output

    Write-Output "STEP: Final audits list"
    Invoke-RestMethod -Uri 'http://localhost:8080/api/audit/admin/all' -Method Get | ConvertTo-Json | Write-Output

} catch {
    Write-Output "ERROR:"
    $_ | ConvertTo-Json | Write-Output
    exit 1
}