package com.cognizant.api_gateway.config;

import org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.cloud.gateway.server.mvc.predicate.GatewayRequestPredicates;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

/**
 * Programmatic route definitions using Spring Cloud Gateway Server WebMVC 5.x API.
 *
 * Each bean groups all paths for one downstream service.
 * GatewayRouterFunctions.route(id)  – creates the route builder
 * HandlerFunctions.http()           – no-arg proxy handler; URI is resolved by the lb() filter
 * LoadBalancerFilterFunctions.lb()  – resolves the Eureka service name to a real host:port
 * GatewayRequestPredicates.path()   – Ant-style path predicate
 *
 * The lb() filter is applied once per builder and wraps every route inside it,
 * so all routes in a bean route to the same downstream service.
 */
@Configuration
public class GatewayConfig {

    // ── user-service (port 8082) ──────────────────────────────────────────
    @Bean
    RouterFunction<ServerResponse> userServiceRoutes() {
        return GatewayRouterFunctions.route("user-service-routes")
                .route(GatewayRequestPredicates.path("/api/auth/**"),        HandlerFunctions.http())
                .route(GatewayRequestPredicates.path("/api/users/**"),       HandlerFunctions.http())
                .route(GatewayRequestPredicates.path("/api/audit-logs/**"),  HandlerFunctions.http())
                .filter(LoadBalancerFilterFunctions.lb("user-service"))
                .build();
    }

    // ── customer-service (port 8083) ─────────────────────────────────────
    @Bean
    RouterFunction<ServerResponse> customerServiceRoutes() {
        return GatewayRouterFunctions.route("customer-service-routes")
                .route(GatewayRequestPredicates.path("/api/customers/**"),    HandlerFunctions.http())
                .route(GatewayRequestPredicates.path("/api/interactions/**"), HandlerFunctions.http())
                .route(GatewayRequestPredicates.path("/api/leads/**"),        HandlerFunctions.http())
                .filter(LoadBalancerFilterFunctions.lb("customer-service"))
                .build();
    }

    // ── inventory-service (port 8085) ────────────────────────────────────
    @Bean
    RouterFunction<ServerResponse> inventoryServiceRoutes() {
        return GatewayRouterFunctions.route("inventory-service-routes")
                .route(GatewayRequestPredicates.path("/api/inventory/**"),    HandlerFunctions.http())
                .route(GatewayRequestPredicates.path("/api/v1/inventory/**"), HandlerFunctions.http())
                .filter(LoadBalancerFilterFunctions.lb("inventory-service"))
                .build();
    }

    // ── sales-service (port 8084) ────────────────────────────────────────
    @Bean
    RouterFunction<ServerResponse> salesServiceRoutes() {
        return GatewayRouterFunctions.route("sales-service-routes")
                .route(GatewayRequestPredicates.path("/api/sales/**"), HandlerFunctions.http())
                .filter(LoadBalancerFilterFunctions.lb("sales-service"))
                .build();
    }

    // ── finance-service (port 8086) ──────────────────────────────────────
    @Bean
    RouterFunction<ServerResponse> financeServiceRoutes() {
        return GatewayRouterFunctions.route("finance-service-routes")
                .route(GatewayRequestPredicates.path("/api/finance/**"), HandlerFunctions.http())
                .filter(LoadBalancerFilterFunctions.lb("finance-service"))
                .build();
    }

    // ── service-management-service (port 8081) ───────────────────────────
    @Bean
    RouterFunction<ServerResponse> serviceManagementRoutes() {
        return GatewayRouterFunctions.route("service-management-routes")
                .route(GatewayRequestPredicates.path("/api/appointments/**"),  HandlerFunctions.http())
                .route(GatewayRequestPredicates.path("/api/workorders/**"),    HandlerFunctions.http())
                .route(GatewayRequestPredicates.path("/api/jobcards/**"),      HandlerFunctions.http())
                .route(GatewayRequestPredicates.path("/api/v1/parts/**"),      HandlerFunctions.http())
                .route(GatewayRequestPredicates.path("/api/v1/warranties/**"), HandlerFunctions.http())
                .route(GatewayRequestPredicates.path("/api/service/media/**"), HandlerFunctions.http())
                .filter(LoadBalancerFilterFunctions.lb("service-management-service"))
                .build();
    }

    // ── CORS Configuration ───────────────────────────────────────────────
    @Bean
    public org.springframework.web.filter.CorsFilter corsFilter() {
        org.springframework.web.cors.CorsConfiguration config = new org.springframework.web.cors.CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new org.springframework.web.filter.CorsFilter(source);
    }
}
