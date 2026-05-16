package com.example.orderservice.service;

import com.example.orderservice.dto.*;
import com.example.orderservice.entity.Order;
import com.example.orderservice.entity.OrderItem;
import com.example.orderservice.repository.OrderItemRepository;
import com.example.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final RestTemplate restTemplate;

    /**
     * Service names resolved via Eureka — no hardcoded IPs/ports needed.
     * @LoadBalanced on the RestTemplate bean handles the DNS resolution.
     */
    private static final String USER_SERVICE = "http://USER-SERVICE";
    private static final String FOOD_SERVICE = "http://FOOD-SERVICE";

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        // ── Validate user via USER-SERVICE (Eureka) ──────────────────────────
        UserValidationResponse userResponse = restTemplate.getForObject(
                USER_SERVICE + "/api/users/" + request.getUserId() + "/validate",
                UserValidationResponse.class
        );

        if (userResponse == null || !userResponse.isValid()) {
            throw new RuntimeException("User validation failed: User does not exist or is invalid");
        }

        // ── Calculate total + validate foods via FOOD-SERVICE (Eureka) ───────
        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0.0;

        for (CreateOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            FoodResponse foodResponse = restTemplate.getForObject(
                    FOOD_SERVICE + "/api/foods/" + itemRequest.getFoodId(),
                    FoodResponse.class
            );

            if (foodResponse == null) {
                throw new RuntimeException("Food not found with id: " + itemRequest.getFoodId());
            }

            double itemTotal = foodResponse.getPrice() * itemRequest.getQuantity();
            totalAmount += itemTotal;

            OrderItem item = new OrderItem();
            item.setFoodId(itemRequest.getFoodId());
            item.setQuantity(itemRequest.getQuantity());
            item.setPrice(foodResponse.getPrice());

            orderItems.add(item);
        }

        // ── Create order ─────────────────────────────────────────────────────
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setTotalAmount(totalAmount);
        order.setStatus("PENDING");
        order = orderRepository.save(order);

        // ── Save order items ─────────────────────────────────────────────────
        for (OrderItem item : orderItems) {
            item.setOrderId(order.getId());
            orderItemRepository.save(item);
        }

        List<OrderItem> savedItems = orderItemRepository.findByOrderId(order.getId());
        return OrderResponse.fromEntity(order, savedItems);
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(order -> {
                    List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
                    return OrderResponse.fromEntity(order, items);
                })
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        List<OrderItem> items = orderItemRepository.findByOrderId(id);
        return OrderResponse.fromEntity(order, items);
    }

    public OrderResponse updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        order.setStatus(status);
        order = orderRepository.save(order);
        List<OrderItem> items = orderItemRepository.findByOrderId(id);
        return OrderResponse.fromEntity(order, items);
    }
}
