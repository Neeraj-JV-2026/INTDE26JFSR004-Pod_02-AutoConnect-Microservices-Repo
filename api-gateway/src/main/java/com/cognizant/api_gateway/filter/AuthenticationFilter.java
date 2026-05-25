package com.cognizant.api_gateway.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.time.Instant;
import java.util.*;

/**
 * Servlet filter that runs before every request routed through the gateway.
 *
 * Public paths (login / register / swagger) are forwarded without checking a token.
 * Every other path must carry a valid Bearer JWT.  On success, three headers are
 * injected into the downstream request so that individual services can read the
 * authenticated user without re-validating the token:
 *   X-User-Id    – userId claim
 *   X-User-Role  – role claim
 *   X-User-Email – JWT subject (email)
 */
@Component
@Order(1)
@Slf4j
public class AuthenticationFilter extends OncePerRequestFilter {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/v3/api-docs",
            "/swagger-ui",
            "/actuator"
    );

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ─────────────────────────────────────────────────────────────────────────

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        // 0. Skip auth for OPTIONS (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // 1. Skip auth for public endpoints
        if (isPublicPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Require Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendError(response, HttpStatus.UNAUTHORIZED,
                    "Missing or malformed Authorization header");
            return;
        }

        String token = authHeader.substring(7);

        try {
            // 3. Validate JWT and extract claims
            Claims claims = parseToken(token);

            String userId = claims.get("userId") != null
                    ? claims.get("userId").toString() : "";
            String role   = claims.get("role")   != null
                    ? claims.get("role").toString()   : "";
            String email  = claims.getSubject()  != null
                    ? claims.getSubject()             : "";

            // 4. Enrich the request with user-identity headers
            MutableHttpServletRequest enriched = new MutableHttpServletRequest(request);
            enriched.putHeader("X-User-Id",    userId);
            enriched.putHeader("X-User-Role",  role);
            enriched.putHeader("X-User-Email", email);

            log.debug("Gateway auth OK | user={} role={} path={}", email, role, path);
            filterChain.doFilter(enriched, response);

        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Gateway auth FAILED | path={} reason={}", path, e.getMessage());
            sendError(response, HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    private Claims parseToken(String token) {
        byte[]    keyBytes = Decoders.BASE64.decode(jwtSecret);
        SecretKey key      = Keys.hmacShaKeyFor(keyBytes);
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private void sendError(HttpServletResponse response,
                           HttpStatus status,
                           String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status",    status.value());
        body.put("error",     status.getReasonPhrase());
        body.put("message",   message);

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Request wrapper that allows adding/overwriting headers
    // ─────────────────────────────────────────────────────────────────────────

    private static class MutableHttpServletRequest extends HttpServletRequestWrapper {

        private final Map<String, String> extraHeaders = new HashMap<>();

        MutableHttpServletRequest(HttpServletRequest request) {
            super(request);
        }

        void putHeader(String name, String value) {
            extraHeaders.put(name, value);
        }

        @Override
        public String getHeader(String name) {
            String v = extraHeaders.get(name);
            return v != null ? v : super.getHeader(name);
        }

        @Override
        public Enumeration<String> getHeaderNames() {
            List<String> names = Collections.list(super.getHeaderNames());
            names.addAll(extraHeaders.keySet());
            return Collections.enumeration(names);
        }

        @Override
        public Enumeration<String> getHeaders(String name) {
            String v = extraHeaders.get(name);
            if (v != null) return Collections.enumeration(List.of(v));
            return super.getHeaders(name);
        }
    }
}
