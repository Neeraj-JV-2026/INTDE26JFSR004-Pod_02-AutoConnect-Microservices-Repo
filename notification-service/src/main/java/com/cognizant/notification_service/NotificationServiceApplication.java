package com.cognizant.notification_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * AutoConnect Notification Service
 *
 * Manages email, SMS, push and in-app notifications for all
 * dealership events (deal finalized, appointment reminder, invoice due, etc.)
 *
 * Port: 8090
 * DB  : notification_service_db (MySQL)
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class NotificationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NotificationServiceApplication.class, args);
    }
}
