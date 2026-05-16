package com.example.foodservice.config;

import com.example.foodservice.entity.Food;
import com.example.foodservice.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(FoodRepository foodRepository) {
        return args -> {
            if (foodRepository.count() == 0) {
                log.info("Seeding initial food data...");

                foodRepository.save(new Food(null, "Phở Bò Hà Nội",
                        "Phở bò truyền thống Hà Nội với nước dùng đậm đà, bò tái, bò chín",
                        45000.0, "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400"));

                foodRepository.save(new Food(null, "Bún Chả Hà Nội",
                        "Bún chả giò thơm ngon, nước mắm pha chua ngọt hài hòa",
                        40000.0, "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400"));

                foodRepository.save(new Food(null, "Cơm Tấm Sườn Bì Chả",
                        "Cơm tấm với sườn nướng thơm lừng, bì chả trứng",
                        50000.0, "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=400"));

                foodRepository.save(new Food(null, "Bánh Mì Thịt",
                        "Bánh mì giòn rụm với pate, thịt nguội, rau thơm và đồ chua",
                        25000.0, "https://images.unsplash.com/photo-1600688640154-9619e002df30?w=400"));

                foodRepository.save(new Food(null, "Gỏi Cuốn Tôm Thịt",
                        "Gỏi cuốn tươi mát với tôm, thịt heo, rau xanh và nước mắm chua ngọt",
                        35000.0, "https://images.unsplash.com/photo-1562967916-eb82221dfb44?w=400"));

                log.info("Seeded 5 food items successfully!");
            }
        };
    }
}
