package com.example.paymentservice;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
public class PaymentController {
    private final RestClient restClient;
    private final String orderUrl;

    public PaymentController(RestClient restClient, @Value("${services.order-url}") String orderUrl) {
        this.restClient = restClient;
        this.orderUrl = orderUrl;
    }

    @PostMapping("/payments")
    public PaymentResponse pay(@Valid @RequestBody PaymentRequest request) throws InterruptedException {
        OrderResponse processingOrder = restClient.patch()
                .uri(orderUrl + "/orders/{id}/status", request.orderId())
                .body(Map.of("status", "PROCESSING_" + request.method()))
                .retrieve()
                .body(OrderResponse.class);

        Thread.sleep(900);

        OrderResponse paidOrder = restClient.patch()
                .uri(orderUrl + "/orders/{id}/status", request.orderId())
                .body(Map.of("status", "PAID"))
                .retrieve()
                .body(OrderResponse.class);

        System.out.printf("Notification: User %s da dat don #%d thanh cong qua %s%n",
                paidOrder.username(), paidOrder.id(), request.method());
        return new PaymentResponse(paidOrder.id(), request.method(), "SUCCESS", paidOrder.total(),
                "Payment completed from " + processingOrder.status());
    }

    record PaymentRequest(@NotNull Long orderId, @NotNull PaymentMethod method) {}
    enum PaymentMethod { COD, BANKING }
    record PaymentResponse(Long orderId, PaymentMethod method, String status, BigDecimal amount, String message) {}
    record OrderItemResponse(Long foodId, String foodName, BigDecimal price, int quantity, BigDecimal lineTotal) {}
    record OrderResponse(Long id, Long userId, String username, String status, BigDecimal total, List<OrderItemResponse> items, String createdAt) {}
}
