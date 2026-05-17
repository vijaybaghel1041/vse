package com.company.vse.controller;

import com.company.vse.entity.AuditProcess;
import com.company.vse.repository.AuditRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "http://localhost:4200")
public class AuditController {

    private static final Logger logger = LoggerFactory.getLogger(AuditController.class);

    @Autowired
    private AuditRepository auditRepository;

    // STEP 1: Member initiates audit (Excel upload mock)
    @PostMapping("/initiate")
    public AuditProcess initiateAudit(@RequestBody Map<String, String> req) {
        String member = req.get("member");
        String auditor = req.get("auditor");
        String excelName = req.get("excelName");

        AuditProcess audit = new AuditProcess();
        audit.setMemberUsername(member);
        audit.setAuditorUsername(auditor);
        audit.setInitialExcelFile(excelName);
        audit.setStatus("PENDING_AUDITOR");
        
        logger.info("AUDIT INITIATED: Member {} assigned Auditor {} with file {}", member, auditor, excelName);
        return auditRepository.save(audit);
    }

    // STEP 2: Auditor submits report
    @PostMapping("/{auditId}/submit-report")
    public AuditProcess submitAuditorReport(@PathVariable Long auditId, @RequestBody Map<String, String> req) {
        AuditProcess audit = auditRepository.findById(auditId).orElseThrow();
        String reportName = req.get("reportName");
        
        audit.setAuditorReportFile(reportName);
        audit.setStatus("AUDITOR_REPORTED");
        
        logger.info("AUDITOR SUBMISSION: Report {} added to Audit ID {}", reportName, auditId);
        return auditRepository.save(audit);
    }

    // STEP 3: Member reviews and responds
    @PostMapping("/{auditId}/member-response")
    public AuditProcess submitMemberResponse(@PathVariable Long auditId, @RequestBody Map<String, String> req) {
        AuditProcess audit = auditRepository.findById(auditId).orElseThrow();
        String responseFile = req.get("responseFile");
        
        audit.setMemberFinalResponseFile(responseFile);
        audit.setStatus("MEMBER_RESPONDED");
        
        logger.info("MEMBER RESPONSE: Final file {} submitted for Admin review in Audit ID {}", responseFile, auditId);
        return auditRepository.save(audit);
    }

    // STEP 4: Admin Approval/Rejection
    @PostMapping("/{auditId}/admin-decision")
    public AuditProcess adminDecision(@PathVariable Long auditId, @RequestBody Map<String, String> req) {
        AuditProcess audit = auditRepository.findById(auditId).orElseThrow();
        String decision = req.get("decision"); // APPROVED or REJECTED
        String comments = req.get("comments");
        
        audit.setStatus(decision);
        audit.setAdminComments(comments);
        
        logger.info("ADMIN DECISION: Audit ID {} is now {} with comments: {}", auditId, decision, comments);
        return auditRepository.save(audit);
    }

    @GetMapping("/member/{username}")
    public List<AuditProcess> getMemberAudits(@PathVariable String username) {
        return auditRepository.findByMemberUsername(username);
    }

    @GetMapping("/auditor/{username}")
    public List<AuditProcess> getAuditorAudits(@PathVariable String username) {
        return auditRepository.findByAuditorUsername(username);
    }

    @GetMapping("/admin/all")
    public List<AuditProcess> getAllAuditsForAdmin() {
        return auditRepository.findAll();
    }
}
