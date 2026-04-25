package fit.iuh.se.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String tokenType;
    private String userId;
    private String username;
    private String email;
    private String role;

    public static AuthResponse of(String token, String userId, String username, String email, String role) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(userId)
                .username(username)
                .email(email)
                .role(role)
                .build();
    }
}
