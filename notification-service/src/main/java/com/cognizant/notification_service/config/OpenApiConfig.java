package com.cognizant.notification_service.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI notificationServiceOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("AutoConnect — Notification Service API")
                        .description("""
                            Manages email, SMS, push, and in-app notifications for all
                            AutoConnect dealership events:
                            • Deal finalized / commission ready
                            • Invoice issued / overdue / paid
                            • Appointment reminder / confirmation
                            • Recall alert broadcast
                            • Service complete sign-off
                            • General system announcements
                            """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("AutoConnect Engineering")
                                .email("engineering@autoconnect.com")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
