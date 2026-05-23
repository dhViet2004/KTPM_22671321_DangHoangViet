package com.example.userservice.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
public class UserController {
    private final AtomicLong ids = new AtomicLong(2);
    private final Map<Long, User> users = new ConcurrentHashMap<>();
    private final JwtService jwtService;

    public UserController(JwtService jwtService) {
        this.jwtService = jwtService;
        users.put(1L, new User(1L, "admin", "123456", "ADMIN"));
        users.put(2L, new User(2L, "user", "123456", "USER"));
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        boolean exists = users.values().stream().anyMatch(user -> user.username().equalsIgnoreCase(request.username()));
        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        long id = ids.incrementAndGet();
        User user = new User(id, request.username(), request.password(), request.role() == null ? "USER" : request.role());
        users.put(id, user);
        return authResponse(user);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return users.values().stream()
                .filter(user -> user.username().equalsIgnoreCase(request.username()) && user.password().equals(request.password()))
                .findFirst()
                .map(this::authResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));
    }

    @GetMapping("/users")
    public List<UserResponse> users() {
        return users.values().stream().map(UserResponse::from).toList();
    }

    @GetMapping("/users/{id}/validate")
    public UserResponse validateUser(@PathVariable Long id) {
        User user = users.get(id);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        return UserResponse.from(user);
    }

    @PostMapping("/token/validate")
    public TokenValidateResponse validateToken(@Valid @RequestBody TokenValidateRequest request) {
        try {
            JwtService.TokenInfo info = jwtService.validate(request.token());
            if (!users.containsKey(info.userId())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token user no longer exists");
            }
            return new TokenValidateResponse(true, info.userId(), info.username(), info.role(), info.expiresAt().toString());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }
    }

    private AuthResponse authResponse(User user) {
        return new AuthResponse(user.id(), user.username(), user.role(),
                jwtService.generateToken(user.id(), user.username(), user.role()));
    }

    record User(Long id, String username, String password, String role) {}
    record RegisterRequest(@NotBlank String username, @NotBlank String password, String role) {}
    record LoginRequest(@NotBlank String username, @NotBlank String password) {}
    record TokenValidateRequest(@NotBlank String token) {}
    record TokenValidateResponse(boolean valid, Long userId, String username, String role, String expiresAt) {}
    record UserResponse(Long id, String username, String role) {
        static UserResponse from(User user) {
            return new UserResponse(user.id(), user.username(), user.role());
        }
    }
    record AuthResponse(Long id, String username, String role, String token) {}
}
