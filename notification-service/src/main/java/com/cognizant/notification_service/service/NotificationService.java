package com.cognizant.notification_service.service;

import com.cognizant.notification_service.dto.BulkNotificationRequestDTO;
import com.cognizant.notification_service.dto.NotificationRequestDTO;
import com.cognizant.notification_service.dto.NotificationResponseDTO;
import com.cognizant.notification_service.entity.Notification;
import com.cognizant.notification_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // ── Create / Send ────────────────────────────────────────────────────────

    /**
     * Create and immediately "dispatch" a notification.
     * In production this would invoke a mail/SMS gateway; here we log + set SENT.
     */
    @Transactional
    public NotificationResponseDTO send(NotificationRequestDTO dto) {
        Notification notification = Notification.builder()
                .userId(dto.getUserId())
                .customerId(dto.getCustomerId())
                .channel(dto.getChannel() != null ? dto.getChannel().toUpperCase() : "IN_APP")
                .notificationType(dto.getNotificationType().toUpperCase())
                .subject(dto.getSubject())
                .message(dto.getMessage())
                .metadata(dto.getMetadata())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .retryCount(0)
                .build();

        notification = notificationRepository.save(notification);

        // Simulate dispatch (real impl: call email/SMS provider)
        notification = dispatch(notification);

        log.info("[Notification] {} → userId={} channel={} status={}",
                notification.getNotificationType(), notification.getUserId(),
                notification.getChannel(), notification.getStatus());

        return toDTO(notification);
    }

    /**
     * Send the same notification to multiple users (bulk broadcast).
     */
    @Transactional
    public List<NotificationResponseDTO> sendBulk(BulkNotificationRequestDTO dto) {
        return dto.getUserIds().stream().map(uid -> {
            NotificationRequestDTO req = new NotificationRequestDTO();
            req.setUserId(uid);
            req.setChannel(dto.getChannel() != null ? dto.getChannel() : "IN_APP");
            req.setNotificationType(dto.getNotificationType());
            req.setSubject(dto.getSubject());
            req.setMessage(dto.getMessage());
            req.setMetadata(dto.getMetadata());
            return send(req);
        }).collect(Collectors.toList());
    }

    // ── Queries ──────────────────────────────────────────────────────────────

    public List<NotificationResponseDTO> getAll() {
        return notificationRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public NotificationResponseDTO getById(Long id) {
        return toDTO(findOrThrow(id));
    }

    public List<NotificationResponseDTO> getByUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<NotificationResponseDTO> getUnread(Long userId) {
        return notificationRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, "SENT")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public long countUnread(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    public List<NotificationResponseDTO> getByCustomer(Long customerId) {
        return notificationRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<NotificationResponseDTO> getByChannel(String channel) {
        return notificationRepository.findByChannelOrderByCreatedAtDesc(channel.toUpperCase())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<NotificationResponseDTO> getByType(String type) {
        return notificationRepository.findByNotificationTypeOrderByCreatedAtDesc(type.toUpperCase())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── Mutations ────────────────────────────────────────────────────────────

    /**
     * Mark a notification as READ and record the timestamp.
     */
    @Transactional
    public NotificationResponseDTO markRead(Long id) {
        Notification n = findOrThrow(id);
        n.setStatus("READ");
        n.setReadAt(LocalDateTime.now());
        return toDTO(notificationRepository.save(n));
    }

    /**
     * Update the status of a notification (ADMIN action).
     * Allowed transitions: PENDING → SENT | FAILED, SENT → READ.
     */
    @Transactional
    public NotificationResponseDTO updateStatus(Long id, String status) {
        Notification n = findOrThrow(id);
        n.setStatus(status.toUpperCase());
        if ("SENT".equals(status.toUpperCase()) && n.getSentAt() == null) {
            n.setSentAt(LocalDateTime.now());
        }
        if ("READ".equals(status.toUpperCase()) && n.getReadAt() == null) {
            n.setReadAt(LocalDateTime.now());
        }
        return toDTO(notificationRepository.save(n));
    }

    /**
     * Retry failed notifications (increments retryCount, re-dispatches).
     */
    @Transactional
    public NotificationResponseDTO retry(Long id) {
        Notification n = findOrThrow(id);
        if (!"FAILED".equals(n.getStatus())) {
            throw new IllegalStateException("Only FAILED notifications can be retried");
        }
        n.setStatus("PENDING");
        n.setRetryCount(n.getRetryCount() + 1);
        n = notificationRepository.save(n);
        n = dispatch(n);
        return toDTO(notificationRepository.save(n));
    }

    @Transactional
    public void delete(Long id) {
        notificationRepository.deleteById(id);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /**
     * Simulate dispatching the notification to an external provider.
     * In production: integrate with SendGrid (email), Twilio (SMS), FCM (push).
     */
    private Notification dispatch(Notification n) {
        try {
            // TODO: replace with real provider calls
            log.info("[Dispatch] channel={} to userId={}: {}",
                    n.getChannel(), n.getUserId(), n.getMessage());
            n.setStatus("SENT");
            n.setSentAt(LocalDateTime.now());
        } catch (Exception e) {
            log.error("[Dispatch] FAILED for notificationId={}: {}", n.getNotificationId(), e.getMessage());
            n.setStatus("FAILED");
        }
        return notificationRepository.save(n);
    }

    private Notification findOrThrow(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));
    }

    private NotificationResponseDTO toDTO(Notification n) {
        return NotificationResponseDTO.builder()
                .notificationId(n.getNotificationId())
                .userId(n.getUserId())
                .customerId(n.getCustomerId())
                .channel(n.getChannel())
                .notificationType(n.getNotificationType())
                .subject(n.getSubject())
                .message(n.getMessage())
                .status(n.getStatus())
                .createdAt(n.getCreatedAt())
                .sentAt(n.getSentAt())
                .readAt(n.getReadAt())
                .metadata(n.getMetadata())
                .retryCount(n.getRetryCount())
                .build();
    }
}
