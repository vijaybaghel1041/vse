package com.company.vse.controller;

import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

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
        String role = req.getOrDefault("role", "MEMBER"); // Accept role from request
        
        logger.info("SIGNUP REQUEST: username={}, email={}, phone={}, role={}", username, email, phone, role);

        // Basic check for existing user
        if (userRepository.findByUsername(username).isPresent()) {
            logger.warn("SIGNUP FAILED: Username {} already exists", username);
            throw new RuntimeException("Username already exists");
        }

        try {
            User user = new User();
            user.setUsername(username);
            user.setPassword(password); // Plain text as requested
            user.setEmail(email);
            user.setPhone(phone);
            user.setRole(role.toUpperCase()); // Set the requested role

            userRepository.save(user);
            logger.info("SIGNUP SUCCESS: User {} created with role {}", username, user.getRole());
            
            return Map.of("message", "User " + username + " registered successfully as " + user.getRole());
        } catch (Exception e) {
            logger.error("SIGNUP ERROR: {}", e.getMessage(), e);
            throw new RuntimeException("Signup failed due to server error: " + e.getMessage());
        }
    }

    /**
     * Login API
     * Checks permanent demo credentials first, then queries the database.
     */
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> req) {

        String username = req.get("username");
        String password = req.get("password");

        logger.info("LOGIN REQUEST: username={}", username);

        // 1. Permanent Demo credentials check (ADMIN)
        if (("admin".equals(username) && "admin123".equals(password)) || 
            ("root".equals(username) && "root".equals(password))) {
            logger.info("LOGIN SUCCESS: Demo ADMIN user {}", username);
            return Map.of(
                    "accessToken", jwtUtil.generateAccessToken(username, "ADMIN"),
                    "refreshToken", jwtUtil.generateRefreshToken(username));
        }

        // 2. Permanent Demo credentials check (MEMBER)
        if ("member".equals(username) && "member123".equals(password)) {
            logger.info("LOGIN SUCCESS: Demo MEMBER user {}", username);
            return Map.of(
                    "accessToken", jwtUtil.generateAccessToken(username, "MEMBER"),
                    "refreshToken", jwtUtil.generateRefreshToken(username));
        }

        // 3. Permanent Demo credentials check (AUDITOR)
        if ("auditor".equals(username) && "auditor123".equals(password)) {
            logger.info("LOGIN SUCCESS: Demo AUDITOR user {}", username);
            return Map.of(
                    "accessToken", jwtUtil.generateAccessToken(username, "AUDITOR"),
                    "refreshToken", jwtUtil.generateRefreshToken(username));
        }

        // 4. Database Check
        try {
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
                User user = userOpt.get();
                logger.info("LOGIN SUCCESS: Database user {} with role {}", username, user.getRole());
                return Map.of(
                        "accessToken", jwtUtil.generateAccessToken(username, user.getRole()),
                        "refreshToken", jwtUtil.generateRefreshToken(username));
            }
        } catch (Exception e) {
            logger.error("LOGIN ERROR (DB): {}", e.getMessage(), e);
        }

        logger.warn("LOGIN FAILED: Invalid credentials for user {}", username);
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
            logger.info("REFRESH REQUEST: user={}", username);
            
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

        logger.warn("REFRESH FAILED: Invalid or missing token");
        throw new RuntimeException("Invalid or expired refresh token");
    }
}
