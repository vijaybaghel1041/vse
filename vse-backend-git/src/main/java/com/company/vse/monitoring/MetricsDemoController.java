package com.company.vse.monitoring;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demo-metrics")
public class MetricsDemoController {

    private final CustomMetricsService customMetricsService;

    public MetricsDemoController(CustomMetricsService customMetricsService) {
        this.customMetricsService = customMetricsService;
    }

    @GetMapping("/trigger")
    public String triggerAction() {
        customMetricsService.simulateBusinessAction();
        return "Business action simulated! Check http://localhost:8080/actuator/prometheus for 'vse_business_action_count_total'.";
    }
}
