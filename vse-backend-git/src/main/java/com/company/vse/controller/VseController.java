package com.company.vse.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.company.vse.entity.VseSubmission;
import com.company.vse.service.VseService;

@RestController
@RequestMapping("/api/vse")
public class VseController {

    private final VseService service;

    public VseController(VseService service) {
        this.service = service;
    }

    @PostMapping
    public VseSubmission submit(@RequestBody VseSubmission vse) {
        return service.save(vse);
    }

    @GetMapping
    public List<VseSubmission> getAll() {
        return service.getAll();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
    
 // VseController.java

    @PutMapping("/{id}")
    public VseSubmission update(
            @PathVariable Long id,
            @RequestBody VseSubmission vse) {

        vse.setId(id);
        return service.save(vse);
    }

}

