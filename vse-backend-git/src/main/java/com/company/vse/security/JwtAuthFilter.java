package com.company.vse.security;

import java.io.IOException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);
    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        
        logger.debug("FILTER: {} {}", method, path);

        // 🔑 Read Authorization header
        String authHeader = request.getHeader("Authorization");

        // ❌ If no token → continue (login, public APIs)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract token
        String token = authHeader.substring(7);

        String username = null;
        String role = null;

        try {
            // Extract username + role
            username = jwtUtil.extractUsername(token);
            role = jwtUtil.extractRole(token);
            logger.debug("EXTRACTED FROM TOKEN: user={}, role={}", username, role);
        } catch (Exception e) {
            logger.warn("TOKEN EXTRACTION FAILED: {}", e.getMessage());
        }

        // 🔒 If token is valid and user not authenticated yet
        if (username != null &&
                SecurityContextHolder.getContext().getAuthentication() == null &&
                jwtUtil.isTokenValid(token)) {

            // ✅ Create authentication object
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role)));

            authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request));

            // ✅ VERY IMPORTANT: set authentication
            SecurityContextHolder.getContext().setAuthentication(authentication);
            logger.debug("CONTEXT AUTHENTICATED: {}", username);
        }

        filterChain.doFilter(request, response);
    }
}
