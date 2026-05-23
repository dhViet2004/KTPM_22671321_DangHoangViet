package com.example.foodservice.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
public class FoodController {
    private final AtomicLong ids = new AtomicLong(4);
    private final Map<Long, Food> foods = new ConcurrentHashMap<>();

    public FoodController() {
        foods.put(1L, new Food(1L, "Com tam suon bi", new BigDecimal("45000"), "Com"));
        foods.put(2L, new Food(2L, "Bun bo Hue", new BigDecimal("50000"), "Bun"));
        foods.put(3L, new Food(3L, "Mi xao hai san", new BigDecimal("60000"), "Mi"));
        foods.put(4L, new Food(4L, "Tra dao cam sa", new BigDecimal("25000"), "Nuoc"));
    }

    @GetMapping("/foods")
    public List<Food> list() {
        return foods.values().stream().sorted((a, b) -> Long.compare(a.id(), b.id())).toList();
    }

    @GetMapping("/foods/{id}")
    public Food get(@PathVariable Long id) {
        Food food = foods.get(id);
        if (food == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found");
        }
        return food;
    }

    @PostMapping("/foods")
    @ResponseStatus(HttpStatus.CREATED)
    public Food create(@Valid @RequestBody FoodRequest request) {
        long id = ids.incrementAndGet();
        Food food = new Food(id, request.name(), request.price(), request.category());
        foods.put(id, food);
        return food;
    }

    @PutMapping("/foods/{id}")
    public Food update(@PathVariable Long id, @Valid @RequestBody FoodRequest request) {
        if (!foods.containsKey(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found");
        }
        Food food = new Food(id, request.name(), request.price(), request.category());
        foods.put(id, food);
        return food;
    }

    @DeleteMapping("/foods/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        foods.remove(id);
    }

    record Food(Long id, String name, BigDecimal price, String category) {}
    record FoodRequest(@NotBlank String name, @PositiveOrZero BigDecimal price, String category) {}
}
