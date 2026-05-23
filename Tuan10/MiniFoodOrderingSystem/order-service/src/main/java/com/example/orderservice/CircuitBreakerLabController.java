package com.example.orderservice;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/circuit-breakers")
public class CircuitBreakerLabController {
    private final CircuitBreakerRegistry registry;
    private final ServiceClients clients;

    public CircuitBreakerLabController(CircuitBreakerRegistry registry, ServiceClients clients) {
        this.registry = registry;
        this.clients = clients;
    }

    @GetMapping
    public List<CircuitBreakerStateResponse> states() {
        return registry.getAllCircuitBreakers().stream()
                .map(this::toResponse)
                .sorted((a, b) -> a.name().compareTo(b.name()))
                .toList();
    }

    @PostMapping("/test/{target}")
    public TestCallResponse test(@PathVariable String target) {
        return runTest(target);
    }

    @PostMapping("/burst/{target}")
    public BurstTestResponse burst(@PathVariable String target,
                                   @RequestParam(defaultValue = "8") int count) {
        int safeCount = Math.max(1, Math.min(count, 30));
        List<TestCallResponse> results = new ArrayList<>();
        for (int i = 0; i < safeCount; i++) {
            try {
                results.add(runTest(target));
            } catch (CircuitBreakerTestException ex) {
                results.add(new TestCallResponse(target, "FAILED", ex.message));
            }
        }

        long success = results.stream().filter(result -> "SUCCESS".equals(result.status())).count();
        long failed = results.size() - success;
        return new BurstTestResponse(target, results.size(), success, failed, results);
    }

    private TestCallResponse runTest(String target) {
        try {
            if ("user".equalsIgnoreCase(target)) {
                ServiceClients.UserResponse user = clients.validateUser(1L);
                return new TestCallResponse("user", "SUCCESS", "Validated user " + user.username());
            }
            if ("food".equalsIgnoreCase(target)) {
                ServiceClients.FoodResponse food = clients.getFood(1L);
                return new TestCallResponse("food", "SUCCESS", "Fetched food " + food.name());
            }
            throw new IllegalArgumentException("Target must be user or food");
        } catch (Exception ex) {
            String message = ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage();
            throw new CircuitBreakerTestException(target, message);
        }
    }

    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    @ExceptionHandler(CircuitBreakerTestException.class)
    public TestCallResponse handleCircuitBreakerTestException(CircuitBreakerTestException ex) {
        return new TestCallResponse(ex.target, "FAILED", ex.message);
    }

    private CircuitBreakerStateResponse toResponse(CircuitBreaker circuitBreaker) {
        CircuitBreaker.Metrics metrics = circuitBreaker.getMetrics();
        return new CircuitBreakerStateResponse(
                circuitBreaker.getName(),
                circuitBreaker.getState().name(),
                metrics.getNumberOfBufferedCalls(),
                metrics.getNumberOfFailedCalls(),
                metrics.getFailureRate()
        );
    }

    record CircuitBreakerStateResponse(String name, String state, int bufferedCalls, int failedCalls, float failureRate) {}
    record TestCallResponse(String target, String status, String message) {}
    record BurstTestResponse(String target, int total, long success, long failed, List<TestCallResponse> results) {}

    private static class CircuitBreakerTestException extends RuntimeException {
        private final String target;
        private final String message;

        private CircuitBreakerTestException(String target, String message) {
            this.target = target;
            this.message = message;
        }
    }
}
