package com.company.vse.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "enabled_members")
@Data
public class EnabledMember {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(length = 50)
    private String memberCode;

    private String auditPeriod;
    private String emailId;

    private String submissionStatus; // e.g. NOT_STARTED, PENDING_AUDITOR, PENDING_ADMIN, COMPLETED
}
