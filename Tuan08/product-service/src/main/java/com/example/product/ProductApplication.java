package com.example.product;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import lombok.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import java.util.stream.Collectors;

@SpringBootApplication
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductApplication {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public static void main(String[] args) {
        SpringApplication.run(ProductApplication.class, args);
    }

    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }

    // READ: Lấy danh sách tất cả sản phẩm
    @GetMapping
    public List<Product> getAllProducts() {
        try {
            Set<String> keys = redisTemplate.keys("product:*");
            if (keys == null) return Collections.emptyList();
            return keys.stream().map(key -> {
                try {
                    String val = redisTemplate.opsForValue().get(key);
                    return val != null ? objectMapper.readValue(val, Product.class) : null;
                } catch (Exception e) {
                    return null;
                }
            }).filter(Objects::nonNull).collect(Collectors.toList());
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    // READ: Lấy thông tin sản phẩm theo ID
    @GetMapping("/{id}")
    public Product getProduct(@PathVariable String id) {
        try {
            String val = redisTemplate.opsForValue().get("product:" + id);
            return val != null ? objectMapper.readValue(val, Product.class) : null;
        } catch (Exception e) {
            return null;
        }
    }

    // CREATE: Thêm sản phẩm mới
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        try {
            // Tự động tạo ID nếu người dùng không truyền vào
            if (product.getId() == null || product.getId().isEmpty()) {
                product.setId(UUID.randomUUID().toString());
            }
            
            // Lưu sản phẩm vào Redis
            redisTemplate.opsForValue().set("product:" + product.getId(), objectMapper.writeValueAsString(product));
            
            // Khởi tạo số lượng (stock) mặc định là 100
            redisTemplate.opsForValue().set("stock:" + product.getId(), "100");
            
            return product;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // UPDATE: Cập nhật sản phẩm theo ID
    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable String id, @RequestBody Product product) {
        try {
            // Kiểm tra xem sản phẩm có tồn tại trong Redis không
            Boolean exists = redisTemplate.hasKey("product:" + id);
            if (Boolean.FALSE.equals(exists)) {
                return null; 
            }
            
            // Đảm bảo ID của object đúng với ID trên URL
            product.setId(id);
            
            // Cập nhật lại dữ liệu trong Redis
            redisTemplate.opsForValue().set("product:" + id, objectMapper.writeValueAsString(product));
            return product;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // DELETE: Xóa sản phẩm theo ID
    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable String id) {
        try {
            // Xóa thông tin sản phẩm và thông tin stock tương ứng
            redisTemplate.delete("product:" + id);
            redisTemplate.delete("stock:" + id);
            return "Đã xóa sản phẩm có ID: " + id;
        } catch (Exception e) {
            e.printStackTrace();
            return "Lỗi khi xóa sản phẩm";
        }
    }

    // Khởi tạo dữ liệu mẫu khi chạy ứng dụng
    @Bean
    CommandLineRunner initData() {
        return args -> {
            List<Product> products = Arrays.asList(
                new Product("1", "iPhone 15 Pro", 1200.0),
                new Product("2", "Samsung S24 Ultra", 1300.0),
                new Product("3", "MacBook M3", 2000.0)
            );
            for (Product p : products) {
                redisTemplate.opsForValue().set("product:" + p.getId(), objectMapper.writeValueAsString(p));
                if (redisTemplate.opsForValue().get("stock:" + p.getId()) == null) {
                    redisTemplate.opsForValue().set("stock:" + p.getId(), "100");
                }
            }
        };
    }

    // Cấu hình CORS để cho phép client gọi API
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**").allowedOrigins("*").allowedMethods("*");
            }
        };
    }
}

@Data @AllArgsConstructor @NoArgsConstructor
class Product {
    private String id;
    private String name;
    private double price;
}