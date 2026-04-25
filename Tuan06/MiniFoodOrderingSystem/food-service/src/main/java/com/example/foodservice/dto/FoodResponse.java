package com.example.foodservice.dto;

import com.example.foodservice.entity.Food;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoodResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String imageUrl;

    public static FoodResponse fromEntity(Food food) {
        return new FoodResponse(
                food.getId(),
                food.getName(),
                food.getDescription(),
                food.getPrice(),
                food.getImageUrl()
        );
    }
}
