package com.company.vse.monitoring;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class CustomMetricsService {

    private final Counter businessActionCounter;
    private final Timer businessActionTimer;

    public CustomMetricsService(MeterRegistry meterRegistry) {
        this.businessActionCounter = Counter.builder("vse.business.action.count")
                .description("Number of times the specific business action was executed")
                .tags("type", "demo")
                .register(meterRegistry);

        this.businessActionTimer = Timer.builder("vse.business.action.time")
                .description("Time taken to execute the specific business action")
                .tags("type", "demo")
                .register(meterRegistry);
    }

    public void simulateBusinessAction() {
        long start = System.currentTimeMillis();
        try {
            Thread.sleep((long) (Math.random() * 500));
            businessActionCounter.increment();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            businessActionTimer.record(System.currentTimeMillis() - start, TimeUnit.MILLISECONDS);
        }
    }
}
