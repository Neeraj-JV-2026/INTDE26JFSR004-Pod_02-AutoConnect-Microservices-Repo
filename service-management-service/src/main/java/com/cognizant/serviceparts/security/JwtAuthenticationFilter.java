package com.cognizant.serviceparts.security;

import com.cognizant.serviceparts.client.IamFeignClient;
import com.cognizant.serviceparts.dto.TokenValidationResponse;
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

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final IamFeignClient iamFeignClient;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            TokenValidationResponse validationResponse = iamFeignClient.validateToken(authHeader);
            if (validationResponse != null && validationResponse.isValid()) {
                List<SimpleGrantedAuthority> authorities = validationResponse.getRole() != null
                        ? List.of(new SimpleGrantedAuthority(validationResponse.getRole()))
                        : Collections.emptyList();

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                validationResponse.getEmail(), authHeader.substring(7), authorities);
                authentication.setDetails(validationResponse);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            log.warn("IAM service unavailable — skipping token validation: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
