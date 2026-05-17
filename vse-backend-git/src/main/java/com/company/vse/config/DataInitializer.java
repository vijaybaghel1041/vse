package com.company.vse.config;

import com.company.vse.entity.User;
import com.company.vse.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository repository) {
        return args -> {
            if (repository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword("admin123");
                admin.setRole("ADMIN");
                admin.setEmail("admin@vse.com");
                admin.setPhone("1234567890");
                repository.save(admin);
            }
            if (repository.findByUsername("member1").isEmpty()) {
                User member = new User();
                member.setUsername("member1");
                member.setPassword("member123");
                member.setRole("MEMBER");
                member.setEmail("member@vse.com");
                member.setPhone("0987654321");
                repository.save(member);
            }
            if (repository.findByUsername("auditor1").isEmpty()) {
                User auditor = new User();
                auditor.setUsername("auditor1");
                auditor.setPassword("auditor123");
                auditor.setRole("AUDITOR");
                auditor.setEmail("auditor@vse.com");
                auditor.setPhone("5554443333");
                repository.save(auditor);
            }
        };
    }
}
