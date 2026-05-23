package com.example.orderservice;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Component
public class ServiceClients {
    private final RestClient restClient;
    private final String userUrl;
    private final String foodUrl;

    public ServiceClients(RestClient restClient,
                          @Value("${services.user-url}") String userUrl,
                          @Value("${services.food-url}") String foodUrl) {
        this.restClient = restClient;
        this.userUrl = userUrl;
        this.foodUrl = foodUrl;
    }

    @CircuitBreaker(name = "userServiceCircuitBreaker", fallbackMethod = "userFallback")
    public UserResponse validateUser(Long userId) {
        return restClient.get()
                .uri(userUrl + "/users/{id}/validate", userId)
                .retrieve()
                .body(UserResponse.class);
    }

    @CircuitBreaker(name = "foodServiceCircuitBreaker", fallbackMethod = "foodFallback")
    public FoodResponse getFood(Long foodId) {
        return restClient.get()
                .uri(foodUrl + "/foods/{id}", foodId)
                .retrieve()
                .body(FoodResponse.class);
    }

    private UserResponse userFallback(Long userId, Throwable cause) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "User Service unavailable or user invalid");
    }

    private FoodResponse foodFallback(Long foodId, Throwable cause) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Food Service unavailable or food invalid");
    }

    public record UserResponse(Long id, String username, String role) {}
    public record FoodResponse(Long id, String name, BigDecimal price, String category) {}
}
