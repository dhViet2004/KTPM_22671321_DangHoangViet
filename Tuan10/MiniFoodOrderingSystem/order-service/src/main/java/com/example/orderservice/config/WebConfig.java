package com.example.orderservice.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class WebConfig {

    /**
     * RestTemplate with @LoadBalanced — resolves service names via Eureka
     * instead of hardcoded IPs/ports.
     *
     * Usage in services:
     *   restTemplate.getForObject("http://USER-SERVICE/api/users/...", ...)
     *   restTemplate.getForObject("http://FOOD-SERVICE/api/foods/...", ...)
     */
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
