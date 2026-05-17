package com.company.vse.repository;

import com.company.vse.entity.AuditProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditRepository extends JpaRepository<AuditProcess, Long> {
    List<AuditProcess> findByMemberUsername(String memberUsername);
    List<AuditProcess> findByAuditorUsername(String auditorUsername);
    List<AuditProcess> findByStatus(String status);
}
