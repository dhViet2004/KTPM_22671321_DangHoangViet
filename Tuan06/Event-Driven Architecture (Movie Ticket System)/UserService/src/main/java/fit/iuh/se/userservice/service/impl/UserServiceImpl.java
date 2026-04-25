package fit.iuh.se.userservice.service.impl;

import fit.iuh.se.userservice.config.JwtUtils;
import fit.iuh.se.userservice.dto.*;
import fit.iuh.se.userservice.entity.User;
import fit.iuh.se.userservice.exception.BadRequestException;
import fit.iuh.se.userservice.exception.ResourceNotFoundException;
import fit.iuh.se.userservice.messaging.UserEventPublisher;
import fit.iuh.se.userservice.repository.UserRepository;
import fit.iuh.se.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserEventPublisher userEventPublisher;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getUsername());

        publishUserRegisteredEvent(savedUser);

        String token = jwtUtils.generateToken(savedUser, savedUser.getId().toString());

        return AuthResponse.of(
                token,
                savedUser.getId().toString(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRole().name()
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Authenticating user: {}", request.getUsername());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new BadRequestException("Invalid username or password");
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtUtils.generateToken(user, user.getId().toString());
        log.info("User authenticated successfully: {}", user.getUsername());

        return AuthResponse.of(
                token,
                user.getId().toString(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    @Override
    public UserResponse getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return UserResponse.builder()
                .id(user.getId().toString())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole().name())
                .build();
    }

    private void publishUserRegisteredEvent(User user) {
        try {
            UserEvent event = UserEvent.userRegistered(
                    user.getId().toString(),
                    user.getUsername(),
                    user.getEmail()
            );
            userEventPublisher.publishUserRegistered(event);
        } catch (Exception e) {
            log.error("Failed to publish USER_REGISTERED event for user: {}", user.getUsername(), e);
        }
    }
}
