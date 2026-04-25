package com.example.notificationservice.service;

import com.example.notificationservice.dto.NotificationRequest;
import com.example.notificationservice.dto.NotificationResponse;
import com.example.notificationservice.entity.Notification;
import com.example.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationResponse sendNotification(NotificationRequest request) {
        log.info("");
        log.info("╔══════════════════════════════════════════════════════════════╗");
        log.info("║              [NOTIFICATION SERVICE]                           ║");
        log.info("╠══════════════════════════════════════════════════════════════╣");
        log.info("║  📬 Gửi thông báo tới User ID: {}                            ", request.getUserId());
        log.info("║  📦 Order ID:  #{}                                          ", request.getOrderId());
        log.info("║  💬 Nội dung:  {}                                             ", request.getMessage());
        log.info("║  ✅ Trạng thái: Đã gửi thành công                          ");
        log.info("╚══════════════════════════════════════════════════════════════╝");
        log.info("");

        Notification notification = new Notification();
        notification.setUserId(request.getUserId());
        notification.setOrderId(request.getOrderId());
        notification.setMessage(request.getMessage());
        notification.setSent(true);
        notificationRepository.save(notification);

        return new NotificationResponse(true, "Notification sent successfully to user " + request.getUserId());
    }
}
