package com.cognizant.finance_service.service;

import com.cognizant.finance_service.dto.NotificationRequestDTO;
import com.cognizant.finance_service.entity.Notification;
import com.cognizant.finance_service.exception.ResourceNotFoundException;
import com.cognizant.finance_service.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService Unit Tests")
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification sampleNotification;

    @BeforeEach
    void setUp() {
        sampleNotification = Notification.builder()
                .notificationId(1L)
                .userId(10L)
                .message("Your invoice #1 is ready.")
                .status("PENDING")
                .category(Notification.NotificationCategory.FINANCE)
                .severity(Notification.Severity.INFO)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("sendNotification: should save with status=PENDING")
    void sendNotification_shouldSaveWithPendingStatus() {
        NotificationRequestDTO dto = new NotificationRequestDTO();
        dto.setUserId(10L);
        dto.setMessage("Your invoice #1 is ready.");
        dto.setCategory(Notification.NotificationCategory.FINANCE);

        when(notificationRepository.save(any(Notification.class))).thenReturn(sampleNotification);

        Notification result = notificationService.sendNotification(dto);

        assertThat(result.getStatus()).isEqualTo("PENDING");
        assertThat(result.getUserId()).isEqualTo(10L);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    @DisplayName("getUserNotifications: should return all notifications for user")
    void getUserNotifications_shouldReturnAll() {
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(sampleNotification));

        List<Notification> result = notificationService.getUserNotifications(10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo(10L);
    }

    @Test
    @DisplayName("getUnreadNotifications: should return only pending notifications")
    void getUnreadNotifications_shouldReturnOnlyPending() {
        when(notificationRepository.findByUserIdAndStatusOrderByCreatedAtDesc(10L, "PENDING")).thenReturn(List.of(sampleNotification));

        List<Notification> result = notificationService.getUnreadNotifications(10L);

        assertThat(result).allMatch(n -> "PENDING".equals(n.getStatus()));
    }

    @Test
    @DisplayName("markAsRead: should set status to READ")
    void markAsRead_shouldSetStatusToRead() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(sampleNotification));
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Notification result = notificationService.markAsRead(1L);

        assertThat(result.getStatus()).isEqualTo("READ");
        assertThat(result.getReadAt()).isNotNull();
        verify(notificationRepository).save(sampleNotification);
    }

    @Test
    @DisplayName("markAllAsRead: should mark all pending notifications as read")
    void markAllAsRead_shouldUpdateAllPending() {
        Notification n2 = Notification.builder()
                .notificationId(2L)
                .userId(10L)
                .status("PENDING")
                .build();

        when(notificationRepository.findByUserIdAndStatusOrderByCreatedAtDesc(10L, "PENDING"))
                .thenReturn(List.of(sampleNotification, n2));

        notificationService.markAllAsRead(10L);

        assertThat(sampleNotification.getStatus()).isEqualTo("READ");
        assertThat(n2.getStatus()).isEqualTo("READ");
        verify(notificationRepository).saveAll(any());
    }

    @Test
    @DisplayName("deleteNotification: should delete when notification exists")
    void deleteNotification_shouldDeleteSuccessfully() {
        notificationService.deleteNotification(1L);
        verify(notificationRepository).deleteById(1L);
    }
}
