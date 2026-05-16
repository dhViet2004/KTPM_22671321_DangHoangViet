package com.example.foodservice.service;

import com.example.foodservice.dto.FoodRequest;
import com.example.foodservice.dto.FoodResponse;
import com.example.foodservice.entity.Food;
import com.example.foodservice.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodRepository foodRepository;

    public List<FoodResponse> getAllFoods() {
        return foodRepository.findAll().stream()
                .map(FoodResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public FoodResponse getFoodById(Long id) {
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food not found with id: " + id));
        return FoodResponse.fromEntity(food);
    }

    public FoodResponse createFood(FoodRequest request) {
        Food food = new Food();
        food.setName(request.getName());
        food.setDescription(request.getDescription());
        food.setPrice(request.getPrice());
        food.setImageUrl(request.getImageUrl());

        food = foodRepository.save(food);
        return FoodResponse.fromEntity(food);
    }

    public FoodResponse updateFood(Long id, FoodRequest request) {
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food not found with id: " + id));

        food.setName(request.getName());
        food.setDescription(request.getDescription());
        food.setPrice(request.getPrice());
        food.setImageUrl(request.getImageUrl());

        food = foodRepository.save(food);
        return FoodResponse.fromEntity(food);
    }

    public void deleteFood(Long id) {
        if (!foodRepository.existsById(id)) {
            throw new RuntimeException("Food not found with id: " + id);
        }
        foodRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return foodRepository.existsById(id);
    }
}
