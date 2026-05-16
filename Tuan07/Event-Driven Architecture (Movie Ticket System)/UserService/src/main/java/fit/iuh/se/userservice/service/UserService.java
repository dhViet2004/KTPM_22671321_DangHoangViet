package fit.iuh.se.userservice.service;

import fit.iuh.se.userservice.dto.*;

public interface UserService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getProfile(String username);
}
