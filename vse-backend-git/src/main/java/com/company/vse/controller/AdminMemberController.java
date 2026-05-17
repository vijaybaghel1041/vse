package com.company.vse.controller;

import com.company.vse.entity.EnabledMember;
import com.company.vse.repository.EnabledMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/members")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminMemberController {

    @Autowired
    private EnabledMemberRepository repository;

    @PostMapping("/enable-bulk")
    public List<EnabledMember> enableMembers(@RequestBody List<Map<String, String>> members) {
        members.forEach(m -> {
            EnabledMember em = new EnabledMember();
            em.setMemberCode(m.get("memberCode"));
            em.setAuditPeriod(m.get("auditPeriod"));
            em.setEmailId(m.get("emailId"));
            em.setSubmissionStatus("NOT_STARTED");
            repository.save(em);
        });
        return repository.findAll();
    }

    @GetMapping("/enabled-all")
    public List<EnabledMember> getEnabledAll() {
        return repository.findAll();
    }
}
