package com.company.vse.repository;

import com.company.vse.entity.EnabledMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EnabledMemberRepository extends JpaRepository<EnabledMember, Long> {
	Optional<EnabledMember> findByEmailId(String emailId);
	Optional<EnabledMember> findByMemberCode(String memberCode);
}
