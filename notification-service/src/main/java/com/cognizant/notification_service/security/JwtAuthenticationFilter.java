package com.cognizant.notification_service.security;

import com.cognizant.notification_service.client.IamFeignClient;
import com.cognizant.notification_service.dto.TokenValidationResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * Validates Bearer tokens by calling the IAM service (/api/auth/validate).
 * On success, populates the Spring Security context with the caller's role.
 * On IAM unavailability, the filter logs a warning and passes through
 * (unauthenticated) — Spring Security will reject any @PreAuthorize calls.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final IamFeignClient iamFeignClient;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            TokenValidationResponse validation = iamFeignClient.validateToken(authHeader);

            if (validation != null && validation.isValid()) {
                List<SimpleGrantedAuthority> authorities = validation.getRole() != null
                        ? List.of(new SimpleGrantedAuthority(validation.getRole()))
                        : Collections.emptyList();

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                validation.getEmail(),
                                authHeader.substring(7),
                                authorities
                        );
                authentication.setDetails(validation);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            log.warn("IAM service unavailable or token invalid: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
