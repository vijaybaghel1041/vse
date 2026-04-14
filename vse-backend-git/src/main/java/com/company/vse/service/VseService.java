package com.company.vse.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.company.vse.entity.VseSubmission;
import com.company.vse.repository.VseRepository;

@Service
public class VseService {

    private final VseRepository repository;

    public VseService(VseRepository repository) {
        this.repository = repository;
    }

    public VseSubmission save(VseSubmission vse) {
        return repository.save(vse);
    }

    public List<VseSubmission> getAll() {
        return repository.findAll();
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
