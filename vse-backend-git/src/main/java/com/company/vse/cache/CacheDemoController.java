package com.company.vse.cache;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cache-demo")
public class CacheDemoController {

    private final CacheDemoService cacheDemoService;

    public CacheDemoController(CacheDemoService cacheDemoService) {
        this.cacheDemoService = cacheDemoService;
    }

    @GetMapping("/report/{id}")
    public String getReport(@PathVariable Long id) {
        long start = System.currentTimeMillis();
        String report = cacheDemoService.getReportById(id);
        long duration = System.currentTimeMillis() - start;
        return "Result: " + report + " (Took " + duration + "ms)";
    }

    @PutMapping("/report/{id}")
    public String updateReport(@PathVariable Long id, @RequestParam String content) {
        return "Updated: " + cacheDemoService.updateReport(id, content);
    }

    @DeleteMapping("/report/{id}")
    public String evictReport(@PathVariable Long id) {
        cacheDemoService.deleteReportFromCache(id);
        return "Evicted report " + id + " from cache!";
    }
}
