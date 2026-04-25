package com.example.paymentservice.service;

import com.example.paymentservice.dto.NotificationRequest;
import com.example.paymentservice.dto.NotificationResponse;
import com.example.paymentservice.dto.OrderResponse;
import com.example.paymentservice.dto.PaymentRequest;
import com.example.paymentservice.dto.PaymentResponse;
import com.example.paymentservice.dto.UpdateStatusRequest;
import com.example.paymentservice.entity.Payment;
import com.example.paymentservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final RestTemplate restTemplate;
    private final PaymentRepository paymentRepository;

    private static final String ORDER_SERVICE = "http://ORDER-SERVICE";
    private static final String NOTIFICATION_SERVICE = "http://NOTIFICATION-SERVICE";

    public PaymentResponse processPayment(PaymentRequest request) {
        log.info("=== [PAYMENT] Processing payment for Order #{} ===", request.getOrderId());

        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setUserId(request.getUserId());
        payment.setPaymentMethod(request.getPaymentMethod());

        try {
            OrderResponse order = restTemplate.getForObject(
                    ORDER_SERVICE + "/api/orders/" + request.getOrderId(),
                    OrderResponse.class
            );

            if (order == null) {
                log.error("[PAYMENT] Order #{} not found", request.getOrderId());
                payment.setSuccess(false);
                payment.setMessage("Order not found");
                paymentRepository.save(payment);
                return new PaymentResponse(false, "Order not found", request.getOrderId(), null);
            }

            if ("PAID".equalsIgnoreCase(order.getStatus())) {
                log.warn("[PAYMENT] Order #{} already paid", request.getOrderId());
                payment.setSuccess(false);
                payment.setMessage("Order already paid");
                paymentRepository.save(payment);
                return new PaymentResponse(false, "Order already paid", request.getOrderId(), order.getStatus());
            }

            if ("CANCELLED".equalsIgnoreCase(order.getStatus())) {
                log.warn("[PAYMENT] Order #{} is cancelled", request.getOrderId());
                payment.setSuccess(false);
                payment.setMessage("Order is cancelled");
                paymentRepository.save(payment);
                return new PaymentResponse(false, "Order is cancelled", request.getOrderId(), order.getStatus());
            }

            log.info("[PAYMENT] Simulating payment processing via {}...", request.getPaymentMethod());
            Thread.sleep(500);

            UpdateStatusRequest statusRequest = new UpdateStatusRequest("PAID");
            HttpEntity<UpdateStatusRequest> entity = new HttpEntity<>(statusRequest);
            ResponseEntity<OrderResponse> response = restTemplate.exchange(
                    ORDER_SERVICE + "/api/orders/" + request.getOrderId() + "/status",
                    HttpMethod.PUT,
                    entity,
                    OrderResponse.class
            );
            OrderResponse updatedOrder = response.getBody();

            log.info("[PAYMENT] Order #{} updated to PAID", request.getOrderId());

            String notificationMessage = "Thanh toán qua " + request.getPaymentMethod() + " thành công. Cảm ơn bạn đã đặt hàng!";
            NotificationRequest notificationRequest = new NotificationRequest(
                    request.getUserId(),
                    request.getOrderId(),
                    notificationMessage
            );

            try {
                NotificationResponse notificationResponse = restTemplate.postForObject(
                        NOTIFICATION_SERVICE + "/api/notifications",
                        notificationRequest,
                        NotificationResponse.class
                );

                if (notificationResponse != null && notificationResponse.isSent()) {
                    log.info("[PAYMENT] Notification sent to User #{}", request.getUserId());
                }
            } catch (Exception e) {
                log.warn("[PAYMENT] Failed to send notification to User #{}: {}",
                        request.getUserId(), e.getMessage());
            }

            String finalStatus = updatedOrder != null ? updatedOrder.getStatus() : "PAID";
            log.info("[PAYMENT] Payment #{} completed successfully via {}",
                    request.getOrderId(), request.getPaymentMethod());

            payment.setSuccess(true);
            payment.setMessage("Payment successful via " + request.getPaymentMethod());
            paymentRepository.save(payment);

            return new PaymentResponse(
                    true,
                    "Payment successful via " + request.getPaymentMethod(),
                    request.getOrderId(),
                    finalStatus
            );

        } catch (Exception e) {
            log.error("[PAYMENT] Payment failed for Order #{}: {}", request.getOrderId(), e.getMessage());
            payment.setSuccess(false);
            payment.setMessage("Payment failed: " + e.getMessage());
            paymentRepository.save(payment);
            return new PaymentResponse(false, "Payment failed: " + e.getMessage(), request.getOrderId(), null);
        }
    }
}
