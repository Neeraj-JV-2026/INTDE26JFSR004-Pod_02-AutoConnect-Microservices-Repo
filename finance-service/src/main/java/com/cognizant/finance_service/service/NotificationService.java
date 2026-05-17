package com.cognizant.finance_service.service;

import com.cognizant.finance_service.dto.NotificationRequestDTO;
import com.cognizant.finance_service.entity.Notification;
import com.cognizant.finance_service.exception.ResourceNotFoundException;
import com.cognizant.finance_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification sendNotification(NotificationRequestDTO dto) {
        Notification notification = Notification.builder()
                .userId(dto.getUserId())
                .relatedEntityId(dto.getRelatedEntityId())
                .message(dto.getMessage())
                .category(dto.getCategory() != null ? dto.getCategory() : Notification.NotificationCategory.SYSTEM)
                .severity(dto.getSeverity() != null ? dto.getSeverity() : Notification.Severity.INFO)
                .status("PENDING")
                .build();
        return notificationRepository.save(notification);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, "PENDING");
    }

    @Transactional
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        notification.setStatus("READ");
        notification.setReadAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = getUnreadNotifications(userId);
        unread.forEach(n -> {
            n.setStatus("READ");
            n.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
}
