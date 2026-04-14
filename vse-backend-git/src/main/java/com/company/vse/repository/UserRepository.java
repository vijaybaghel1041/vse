package com.company.vse.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.company.vse.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}