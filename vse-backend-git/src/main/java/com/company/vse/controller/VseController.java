package com.company.vse.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(VseController.class);
    private final VseService service;

    public VseController(VseService service) {
        this.service = service;
    }

    @PostMapping
    public VseSubmission submit(@RequestBody VseSubmission vse) {
        logger.info("SUBMIT REQUEST: employeeId={}", vse.getEmployeeId());
        return service.save(vse);
    }

    @GetMapping
    public List<VseSubmission> getAll() {
        logger.info("GET ALL REQUEST");
        return service.getAll();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        logger.info("DELETE REQUEST: id={}", id);
        service.delete(id);
    }
    
 // VseController.java

    @PutMapping("/{id}")
    public VseSubmission update(
            @PathVariable Long id,
            @RequestBody VseSubmission vse) {
        logger.info("UPDATE REQUEST: id={}", id);
        vse.setId(id);
        return service.save(vse);
    }

}
