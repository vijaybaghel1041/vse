package com.company.vse.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "vse_audits")
@Data
public class AuditProcess {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String memberUsername;
    private String auditorUsername;
    private String status; // PENDING_AUDITOR, PENDING_MEMBER_REVIEW, PENDING_ADMIN, APPROVED, REJECTED

    private String initialExcelFile;
    private String auditorReportFile;
    private String memberFinalResponseFile;
    private String adminComments;

    @Column(columnDefinition = "TEXT")
    private String auditDescription;
}
