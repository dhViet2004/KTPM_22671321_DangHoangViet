package com.oauth2.demo.authserver.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import org.springframework.stereotype.Component;

import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {
    private final RsaKeyProvider rsaKeyProvider;
    private static final long EXPIRATION_TIME = 3600000; // 1 hour

    public JwtTokenProvider(RsaKeyProvider rsaKeyProvider) {
        this.rsaKeyProvider = rsaKeyProvider;
    }

    public String generateAccessToken(String username, String scope) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", username);
        claims.put("scope", scope);
        claims.put("type", "access_token");

        return createToken(claims, username, EXPIRATION_TIME);
    }

    public String generateRefreshToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", username);
        claims.put("type", "refresh_token");

        return createToken(claims, username, EXPIRATION_TIME * 24); // 24 hours
    }

    private String createToken(Map<String, Object> claims, String subject, long expirationTime) {
        PrivateKey privateKey = rsaKeyProvider.getPrivateKey();

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(privateKey)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        return parseToken(token).getPayload().getSubject();
    }

    private Jws<Claims> parseToken(String token) {
        PublicKey publicKey = rsaKeyProvider.getPublicKey();
        return Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(token);
    }
}
