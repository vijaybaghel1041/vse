package com.company.vse.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.company.vse.entity.User;
import com.company.vse.repository.UserRepository;
import com.company.vse.security.JwtUtil;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public AuthController(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    /**
     * Signup/Register API
     * Persists new user to the database.
     */
    @PostMapping("/register")
    public Map<String, String> register(@RequestBody Map<String, String> req) {
        String username = req.get("username");
        String password = req.get("password");
        String email = req.get("email");
        String phone = req.get("phone");
        
        // Basic check for existing user
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(password); // Plain text as requested
        user.setEmail(email);
        user.setPhone(phone);
        user.setRole("MEMBER"); // Default role

        userRepository.save(user);
        
        return Map.of("message", "User " + username + " registered successfully");
    }

    /**
     * Login API
     * Checks permanent demo credentials first, then queries the database.
     */
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> req) {

        String username = req.get("username");
        String password = req.get("password");

        // 1. Permanent Demo credentials check (ADMIN)
        if (("admin".equals(username) && "admin123".equals(password)) || 
            ("root".equals(username) && "root".equals(password))) {
            return Map.of(
                    "accessToken", jwtUtil.generateAccessToken(username, "ADMIN"),
                    "refreshToken", jwtUtil.generateRefreshToken(username));
        }

        // 2. Permanent Demo credentials check (MEMBER)
        if ("member".equals(username) && "member123".equals(password)) {
            return Map.of(
                    "accessToken", jwtUtil.generateAccessToken(username, "MEMBER"),
                    "refreshToken", jwtUtil.generateRefreshToken(username));
        }

        // 3. Permanent Demo credentials check (AUDITOR)
        if ("auditor".equals(username) && "auditor123".equals(password)) {
            return Map.of(
                    "accessToken", jwtUtil.generateAccessToken(username, "AUDITOR"),
                    "refreshToken", jwtUtil.generateRefreshToken(username));
        }

        // 4. Database Check
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            User user = userOpt.get();
            return Map.of(
                    "accessToken", jwtUtil.generateAccessToken(username, user.getRole()),
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
            
            // Determine role (Demo vs DB)
            String assignedRole = "MEMBER";
            if (username.equals("admin") || username.equals("root")) {
                assignedRole = "ADMIN";
            } else if (username.equals("auditor")) {
                assignedRole = "AUDITOR";
            } else {
                assignedRole = userRepository.findByUsername(username)
                        .map(User::getRole)
                        .orElse("MEMBER");
            }

            return Map.of(
                "accessToken", jwtUtil.generateAccessToken(username, assignedRole),
                "refreshToken", jwtUtil.generateRefreshToken(username)
            );
        }

        throw new RuntimeException("Invalid or expired refresh token");
    }
}
