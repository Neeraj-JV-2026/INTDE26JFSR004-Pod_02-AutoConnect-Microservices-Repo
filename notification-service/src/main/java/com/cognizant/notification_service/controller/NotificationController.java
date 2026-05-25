package com.cognizant.notification_service.controller;

import com.cognizant.notification_service.dto.BulkNotificationRequestDTO;
import com.cognizant.notification_service.dto.NotificationRequestDTO;
import com.cognizant.notification_service.dto.NotificationResponseDTO;
import com.cognizant.notification_service.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Send, query and manage user notifications")
public class NotificationController {

    private final NotificationService notificationService;

    // ── Create ───────────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'FINANCE_OFFICER', 'SALES_CONSULTANT', 'SERVICE_ADVISOR', 'AUDITOR', 'TECHNICIAN', 'PARTS_MANAGER')")
    @Operation(summary = "Send a notification to a single user")
    public ResponseEntity<NotificationResponseDTO> send(
            @Valid @RequestBody NotificationRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.send(dto));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Broadcast a notification to multiple users (e.g. recall alert to all customers)")
    public ResponseEntity<List<NotificationResponseDTO>> sendBulk(
            @RequestBody @Valid BulkNotificationRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.sendBulk(dto));
    }

    // ── Read ─────────────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'AUDITOR')")
    @Operation(summary = "Get all notifications (admin / auditor only)")
    public ResponseEntity<List<NotificationResponseDTO>> getAll() {
        return ResponseEntity.ok(notificationService.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'AUDITOR', 'FINANCE_OFFICER', 'SALES_CONSULTANT', 'SERVICE_ADVISOR')")
    @Operation(summary = "Get a notification by ID")
    public ResponseEntity<NotificationResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getById(id));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'AUDITOR', 'FINANCE_OFFICER', 'SALES_CONSULTANT', 'SERVICE_ADVISOR', 'CUSTOMER')")
    @Operation(summary = "Get all notifications for a user (newest first)")
    public ResponseEntity<List<NotificationResponseDTO>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getByUser(userId));
    }

    @GetMapping("/user/{userId}/unread")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'AUDITOR', 'FINANCE_OFFICER', 'SALES_CONSULTANT', 'SERVICE_ADVISOR', 'CUSTOMER')")
    @Operation(summary = "Get unread (SENT) notifications for a user")
    public ResponseEntity<List<NotificationResponseDTO>> getUnread(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnread(userId));
    }

    @GetMapping("/user/{userId}/unread/count")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'AUDITOR', 'FINANCE_OFFICER', 'SALES_CONSULTANT', 'SERVICE_ADVISOR', 'CUSTOMER')")
    @Operation(summary = "Get unread notification count for a user (used for badge display)")
    public ResponseEntity<Map<String, Long>> countUnread(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.countUnread(userId)));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'AUDITOR', 'SALES_CONSULTANT', 'SERVICE_ADVISOR', 'CUSTOMER')")
    @Operation(summary = "Get all notifications for a CRM customer")
    public ResponseEntity<List<NotificationResponseDTO>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(notificationService.getByCustomer(customerId));
    }

    @GetMapping("/channel/{channel}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'AUDITOR')")
    @Operation(summary = "Get notifications by channel (EMAIL, SMS, PUSH, IN_APP)")
    public ResponseEntity<List<NotificationResponseDTO>> getByChannel(@PathVariable String channel) {
        return ResponseEntity.ok(notificationService.getByChannel(channel));
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'AUDITOR')")
    @Operation(summary = "Get notifications by business event type (e.g. INVOICE_OVERDUE)")
    public ResponseEntity<List<NotificationResponseDTO>> getByType(@PathVariable String type) {
        return ResponseEntity.ok(notificationService.getByType(type));
    }

    // ── Mutations ────────────────────────────────────────────────────────────

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'FINANCE_OFFICER', 'SALES_CONSULTANT', 'SERVICE_ADVISOR', 'CUSTOMER', 'TECHNICIAN', 'PARTS_MANAGER')")
    @Operation(summary = "Mark a notification as READ")
    public ResponseEntity<NotificationResponseDTO> markRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markRead(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Update the delivery status of a notification (ADMIN only)")
    public ResponseEntity<NotificationResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(notificationService.updateStatus(id, status));
    }

    @PostMapping("/{id}/retry")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Retry a failed notification")
    public ResponseEntity<NotificationResponseDTO> retry(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.retry(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Delete a notification record")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
