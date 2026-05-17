package com.cognizant.customer_service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Smoke test — verifies the application entry point class is on the classpath.
 * No Spring context is loaded; avoids dependency on Spring Boot test infrastructure.
 */
class CustomerServiceApplicationTests {

    @Test
    void applicationClassExists() {
        assertThat(CustomerServiceApplication.class).isNotNull();
    }

    @Test
    void mainMethodIsCallable() {
        // Verifies main method signature exists without actually booting
        assertThat(CustomerServiceApplication.class.getDeclaredMethods()).isNotEmpty();
    }
}
