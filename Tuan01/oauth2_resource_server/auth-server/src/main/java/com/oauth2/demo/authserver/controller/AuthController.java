package com.oauth2.demo.authserver.controller;

import com.oauth2.demo.authserver.config.JwtTokenProvider;
import com.oauth2.demo.authserver.config.RsaKeyProvider;
import com.oauth2.demo.authserver.dto.LoginRequest;
import com.oauth2.demo.authserver.dto.TokenResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Base64;
import java.security.interfaces.RSAPublicKey;

@RestController
@RequestMapping("/oauth2")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {
    private final JwtTokenProvider jwtTokenProvider;
    private final RsaKeyProvider rsaKeyProvider;

    // Simple user database (for demo purposes)
    private static final Map<String, String> USERS = new HashMap<>();

    static {
        USERS.put("user1", "password123");
        USERS.put("user2", "password456");
        USERS.put("admin", "admin123");
    }

    public AuthController(JwtTokenProvider jwtTokenProvider, RsaKeyProvider rsaKeyProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.rsaKeyProvider = rsaKeyProvider;
    }

    @PostMapping("/token")
    public ResponseEntity<?> getToken(@RequestBody LoginRequest request) {
        // Validate credentials
        if (!USERS.containsKey(request.getUsername()) || 
            !USERS.get(request.getUsername()).equals(request.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        // Determine scope based on username
        String scope = request.getUsername().equals("admin") ? "ADMIN READ WRITE" : "READ";

        String accessToken = jwtTokenProvider.generateAccessToken(request.getUsername(), scope);
        String refreshToken = jwtTokenProvider.generateRefreshToken(request.getUsername());

        TokenResponse response = new TokenResponse(
            accessToken,
            refreshToken,
            "Bearer",
            3600,
            scope
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refresh_token");

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid refresh token"));
        }

        String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
        String scope = username.equals("admin") ? "ADMIN READ WRITE" : "READ";
        String newAccessToken = jwtTokenProvider.generateAccessToken(username, scope);

        TokenResponse response = new TokenResponse(
            newAccessToken,
            refreshToken,
            "Bearer",
            3600,
            scope
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/public-key")
    public ResponseEntity<?> getPublicKey() {
        return ResponseEntity.ok(Map.of(
            "public_key", rsaKeyProvider.getPublicKeyPEM(),
            "algorithm", "RSA"
        ));
    }

    @GetMapping("/.well-known/jwks.json")
    public ResponseEntity<?> jwks() {
        RSAPublicKey publicKey = (RSAPublicKey) rsaKeyProvider.getPublicKey();

        // Base64 URL-encode modulus and exponent without padding (strip leading zero if present)
        byte[] modulusBytes = publicKey.getModulus().toByteArray();
        if (modulusBytes[0] == 0) {
            byte[] tmp = new byte[modulusBytes.length - 1];
            System.arraycopy(modulusBytes, 1, tmp, 0, tmp.length);
            modulusBytes = tmp;
        }
        byte[] exponentBytes = publicKey.getPublicExponent().toByteArray();
        if (exponentBytes[0] == 0) {
            byte[] tmp = new byte[exponentBytes.length - 1];
            System.arraycopy(exponentBytes, 1, tmp, 0, tmp.length);
            exponentBytes = tmp;
        }

        String n = Base64.getUrlEncoder().withoutPadding().encodeToString(modulusBytes);
        String e = Base64.getUrlEncoder().withoutPadding().encodeToString(exponentBytes);

        Map<String, Object> jwk = new HashMap<>();
        jwk.put("kty", "RSA");
        jwk.put("alg", "RS256");
        jwk.put("use", "sig");
        jwk.put("n", n);
        jwk.put("e", e);
        jwk.put("kid", "auth-server-key");

        return ResponseEntity.ok(Map.of("keys", List.of(jwk)));
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "Auth Server is running"));
    }
}
