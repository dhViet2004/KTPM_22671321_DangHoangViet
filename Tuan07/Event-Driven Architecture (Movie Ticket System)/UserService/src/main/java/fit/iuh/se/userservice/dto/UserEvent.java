package fit.iuh.se.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEvent {

    @Builder.Default
    private String eventId = "EVT-U-" + UUID.randomUUID().toString().substring(0, 6);
    private String eventType;
    private String userId;
    private String username;
    private String email;
    private String phoneNumber;
    private LocalDateTime timestamp;

    public static UserEvent userRegistered(String userId, String username, String email) {
        return UserEvent.builder()
                .eventType("USER_REGISTERED")
                .userId(userId)
                .username(username)
                .email(email)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
