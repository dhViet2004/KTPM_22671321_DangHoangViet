package com.example.orderservice;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
public class OrderController {
    private final AtomicLong ids = new AtomicLong();
    private final Map<Long, OrderResponse> orders = new ConcurrentHashMap<>();
    private final ServiceClients clients;

    public OrderController(ServiceClients clients) {
        this.clients = clients;
    }

    @PostMapping("/orders")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse create(@Valid @RequestBody CreateOrderRequest request) {
        ServiceClients.UserResponse user = clients.validateUser(request.userId());
        List<OrderItemResponse> items = request.items().stream().map(item -> {
            ServiceClients.FoodResponse food = clients.getFood(item.foodId());
            BigDecimal lineTotal = food.price().multiply(BigDecimal.valueOf(item.quantity()));
            return new OrderItemResponse(food.id(), food.name(), food.price(), item.quantity(), lineTotal);
        }).toList();

        BigDecimal total = items.stream().map(OrderItemResponse::lineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        long id = ids.incrementAndGet();
        OrderResponse order = new OrderResponse(id, user.id(), user.username(), "CREATED", total, items, Instant.now());
        orders.put(id, order);
        return order;
    }

    @GetMapping("/orders")
    public List<OrderResponse> list(@RequestParam(required = false) Long userId) {
        return orders.values().stream()
                .filter(order -> userId == null || order.userId().equals(userId))
                .sorted((a, b) -> Long.compare(a.id(), b.id()))
                .toList();
    }

    @GetMapping("/orders/{id}")
    public OrderResponse get(@PathVariable Long id) {
        OrderResponse order = orders.get(id);
        if (order == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return order;
    }

    @PatchMapping("/orders/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateStatusRequest request) {
        OrderResponse order = get(id);
        OrderResponse updated = new OrderResponse(order.id(), order.userId(), order.username(), request.status(), order.total(), order.items(), order.createdAt());
        orders.put(id, updated);
        return updated;
    }

    record CreateOrderRequest(@NotNull Long userId, @NotEmpty List<CreateOrderItemRequest> items) {}
    record CreateOrderItemRequest(@NotNull Long foodId, @Positive int quantity) {}
    record UpdateStatusRequest(@NotNull String status) {}
    record OrderItemResponse(Long foodId, String foodName, BigDecimal price, int quantity, BigDecimal lineTotal) {}
    record OrderResponse(Long id, Long userId, String username, String status, BigDecimal total, List<OrderItemResponse> items, Instant createdAt) {}
}
