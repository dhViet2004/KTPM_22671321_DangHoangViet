package com.example.foodservice.controller;

import com.example.foodservice.dto.FoodRequest;
import com.example.foodservice.dto.FoodResponse;
import com.example.foodservice.service.FoodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FoodController {

    private final FoodService foodService;

    @GetMapping
    public ResponseEntity<List<FoodResponse>> getAllFoods() {
        return ResponseEntity.ok(foodService.getAllFoods());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodResponse> getFoodById(@PathVariable Long id) {
        return ResponseEntity.ok(foodService.getFoodById(id));
    }

    @PostMapping
    public ResponseEntity<FoodResponse> createFood(@Valid @RequestBody FoodRequest request) {
        return ResponseEntity.ok(foodService.createFood(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodResponse> updateFood(@PathVariable Long id,
                                                   @Valid @RequestBody FoodRequest request) {
        return ResponseEntity.ok(foodService.updateFood(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFood(@PathVariable Long id) {
        foodService.deleteFood(id);
        return ResponseEntity.noContent().build();
    }
}
