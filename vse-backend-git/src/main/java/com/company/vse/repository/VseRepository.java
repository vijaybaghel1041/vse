package com.company.vse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.company.vse.entity.VseSubmission;

@Repository
public interface VseRepository extends JpaRepository<VseSubmission, Long> {
}

