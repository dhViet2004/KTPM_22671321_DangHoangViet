package fit.iuh.se.userservice.messaging;

import fit.iuh.se.userservice.config.RabbitMQConfig;
import fit.iuh.se.userservice.dto.UserEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishUserRegistered(UserEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.USER_EXCHANGE,
                    RabbitMQConfig.USER_REGISTERED_ROUTING_KEY,
                    event
            );
            log.info("Published USER_REGISTERED event for user: {} ({})", 
                    event.getUsername(), event.getEmail());
        } catch (Exception e) {
            log.error("Failed to publish USER_REGISTERED event for user: {}", 
                    event.getUsername(), e);
            throw e;
        }
    }
}
