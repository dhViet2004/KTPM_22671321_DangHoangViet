package com.oauth2.demo.resourceserver.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ResourceController {

    @GetMapping("/public/hello")
    public ResponseEntity<?> publicResource() {
        return ResponseEntity.ok(Map.of(
            "message", "This is a public resource - no authentication required"
        ));
    }

    @GetMapping("/user/data")
    public ResponseEntity<?> userResource(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
            "message", "User resource accessed successfully",
            "username", authentication.getName(),
            "authorities", authentication.getAuthorities().toString()
        ));
    }

    @GetMapping("/user/profile")
    public ResponseEntity<?> userProfile(Authentication authentication) {
        Map<String, Object> profile = new HashMap<>();
        profile.put("username", authentication.getName());
        profile.put("authorities", authentication.getAuthorities());
        profile.put("authenticated", authentication.isAuthenticated());
        profile.put("details", authentication.getDetails());
        
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/admin/settings")
    public ResponseEntity<?> adminResource(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
            "message", "Admin resource accessed successfully",
            "username", authentication.getName(),
            "authorities", authentication.getAuthorities().toString()
        ));
    }

    @PostMapping("/user/update")
    public ResponseEntity<?> updateUserData(@RequestBody Map<String, String> data, Authentication authentication) {
        return ResponseEntity.ok(Map.of(
            "message", "User data updated successfully",
            "username", authentication.getName(),
            "updatedData", data
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "Resource Server is running"));
    }
}
