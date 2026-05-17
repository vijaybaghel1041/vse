package com.company.vse.cache;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class CacheDemoService {

    private static final Logger logger = LoggerFactory.getLogger(CacheDemoService.class);
    
    // Simulating a database
    private final Map<Long, String> mockDatabase = new HashMap<>();

    public CacheDemoService() {
        mockDatabase.put(1L, "Enterprise Audit Report 2025");
        mockDatabase.put(2L, "Financial Summary Q1");
    }

    // @Cacheable: First call hits this method, subsequent calls with same ID return from Redis
    @Cacheable(value = "reports", key = "#id")
    public String getReportById(Long id) {
        logger.info("=========================================");
        logger.info("CACHE MISS! Fetching report {} from simulated Database...", id);
        logger.info("=========================================");
        simulateSlowDB();
        return mockDatabase.getOrDefault(id, "Report Not Found");
    }

    // @CachePut: Always updates the Database AND updates the Redis Cache
    @CachePut(value = "reports", key = "#id")
    public String updateReport(Long id, String newContent) {
        logger.info("UPDATING Database and Cache for report {}", id);
        mockDatabase.put(id, newContent);
        return newContent;
    }

    // @CacheEvict: Removes the item from the Redis Cache
    @CacheEvict(value = "reports", key = "#id")
    public void deleteReportFromCache(Long id) {
        logger.info("EVICTING report {} from cache", id);
    }

    private void simulateSlowDB() {
        try {
            Thread.sleep(2000); // 2 second delay to simulate slow query
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
