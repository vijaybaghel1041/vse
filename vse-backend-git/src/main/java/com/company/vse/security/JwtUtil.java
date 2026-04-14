package com.company.vse.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * JwtUtil is a helper/utility class.
 * It handles all JWT-related operations:
 * - Token creation
 * - Token validation
 * - Reading data from token
 */
@Component
public class JwtUtil {

    // Secret key used to sign JWT
    // (Must be same while generating & validating token)
    private static final String SECRET =
            "mysecretkeymysecretkeymysecretkeymysecretkey";

    // Token validity time (1 hour)
    private static final long EXPIRATION_TIME = 60 * 60 * 1000;
    

    // Create signing key using secret
    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    /**
     * Called from AuthController after successful login
     */
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)                // store username inside token
                .claim("role", role) // 👈 IMPORTANT
                .setIssuedAt(new Date())              // token creation time
                .setExpiration(
                        new Date(System.currentTimeMillis() + EXPIRATION_TIME)
                )
                .signWith(key, SignatureAlgorithm.HS256) // sign token
                .compact();
    }

    /**
     * Called from JwtAuthFilter
     * Used to read username from token
     */
    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Called from JwtAuthFilter
     * Checks if token is valid or expired
     */
    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // Internal method to parse token
    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }
    
    
    
    
    
    //Referesh token logic(Reauthenticate itself over time with outh relogin the user )
    private static final long ACCESS_EXP = 15 * 60 * 1000;   // 15 min
    private static final long REFRESH_EXP = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    public String generateAccessToken(String username, String role) {
        return Jwts.builder()
            .setSubject(username)
            .claim("role", role)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + ACCESS_EXP))
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    public String generateRefreshToken(String username) {
        return Jwts.builder()
            .setSubject(username)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + REFRESH_EXP))
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
}
