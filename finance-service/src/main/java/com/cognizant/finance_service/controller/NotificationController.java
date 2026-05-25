package com.cognizant.finance_service.controller;

import com.cognizant.finance_service.dto.NotificationRequestDTO;
import com.cognizant.finance_service.entity.Notification;
import com.cognizant.finance_service.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User notification management APIs")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'SALES_CONSULTANT', 'SERVICE_ADVISOR', 'PARTS_MANAGER')")
    @Operation(summary = "Send a notification to a user")
    public ResponseEntity<Notification> sendNotification(@Valid @RequestBody NotificationRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.sendNotification(dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'AUDITOR')")
    @Operation(summary = "Get all notifications (ADMIN / FINANCE_OFFICER / AUDITOR only)")
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'AUDITOR', 'TECHNICIAN', 'SALES_CONSULTANT', 'SERVICE_ADVISOR')")
    @Operation(summary = "Get all notifications for a user")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/user/{userId}/unread")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'AUDITOR', 'TECHNICIAN', 'SALES_CONSULTANT', 'SERVICE_ADVISOR')")
    @Operation(summary = "Get unread notifications for a user")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'TECHNICIAN', 'SALES_CONSULTANT', 'SERVICE_ADVISOR')")
    @Operation(summary = "Mark a single notification as read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PatchMapping("/user/{userId}/read-all")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'TECHNICIAN', 'SALES_CONSULTANT', 'SERVICE_ADVISOR')")
    @Operation(summary = "Mark all notifications for a user as read")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Delete a notification")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
