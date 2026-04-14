package com.company.vse.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.company.vse.security.JwtUtil;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    private final JwtUtil jwtUtil;

    public AuthController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * Signup/Register API
     * Mock endpoint to parse the incoming register request.
     */
    @PostMapping("/register")
    public Map<String, String> register(@RequestBody Map<String, String> req) {
        String username = req.get("username");
        String password = req.get("password");
        String email = req.get("email");
        String phone = req.get("phone");
        
        // Mock successful registration
        return Map.of("message", "User " + username + " registered successfully");
    }

    /**
     * Login API
     * Called from Angular login page
     */
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> req) {

        String username = req.get("username");
        String password = req.get("password");

        // Demo credentials
        if (("admin".equals(username) && "admin123".equals(password)) || 
            ("root".equals(username) && "root".equals(password))) {
            return Map.of(
                    "accessToken", jwtUtil.generateAccessToken(username, "ADMIN"),
                    "refreshToken", jwtUtil.generateRefreshToken(username));
        }

        if ("member".equals(username) && "member123".equals(password)) {
            return Map.of(
                    "accessToken", jwtUtil.generateAccessToken(username, "MEMBER"),
                    "refreshToken", jwtUtil.generateRefreshToken(username));
        }

        if ("auditor".equals(username) && "auditor123".equals(password)) {
            return Map.of(
                    "accessToken", jwtUtil.generateAccessToken(username, "AUDITOR"),
                    "refreshToken", jwtUtil.generateRefreshToken(username));
        }

        throw new RuntimeException("Invalid credentials");
    }

    /**
     * Refresh Token API
     * Exchanges a valid refreshToken for a new accessToken.
     */
    @PostMapping("/refresh")
    public Map<String, String> refresh(@RequestBody Map<String, String> req) {
        String refreshToken = req.get("refreshToken");

        if (refreshToken != null && jwtUtil.isTokenValid(refreshToken)) {
            String username = jwtUtil.extractUsername(refreshToken);
            
            // Hardcoded Role lookup logic since we don't have a DB yet.
            String assignedRole = "MEMBER";
            if (username.equals("admin") || username.equals("root")) {
                assignedRole = "ADMIN";
            } else if (username.equals("auditor")) {
                assignedRole = "AUDITOR";
            }

            return Map.of(
                "accessToken", jwtUtil.generateAccessToken(username, assignedRole),
                "refreshToken", jwtUtil.generateRefreshToken(username)
            );
        }

        throw new RuntimeException("Invalid or expired refresh token");
    }
}
