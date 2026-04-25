package fit.iuh.se.userservice.messaging;

import fit.iuh.se.userservice.config.RabbitMQConfig;
import fit.iuh.se.userservice.dto.UserEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Consumer để test event - Xác nhận event được gửi qua RabbitMQ thành công
 * Sau khi verify xong có thể xóa consumer này
 */
@Component
@Slf4j
public class UserEventConsumer {

    @RabbitListener(queues = RabbitMQConfig.USER_REGISTERED_QUEUE)
    public void handleUserRegistered(UserEvent event) {
        log.info("============================================");
        log.info("   EVENT NHẬN ĐƯỢC TỪ RABBITMQ!");
        log.info("============================================");
        log.info("Event Type: {}", event.getEventType());
        log.info("User ID: {}", event.getUserId());
        log.info("Username: {}", event.getUsername());
        log.info("Email: {}", event.getEmail());
        log.info("Timestamp: {}", event.getTimestamp());
        log.info("============================================");
    }
}
