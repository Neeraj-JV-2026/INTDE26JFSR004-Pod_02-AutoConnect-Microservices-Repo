package com.cognizant.notification_service.repository;

import com.cognizant.notification_service.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /** All notifications for a given user, newest first */
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** Unread (SENT but not READ) notifications for a user */
    List<Notification> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);

    /** All notifications by channel */
    List<Notification> findByChannelOrderByCreatedAtDesc(String channel);

    /** All notifications by type */
    List<Notification> findByNotificationTypeOrderByCreatedAtDesc(String notificationType);

    /** Pending notifications (PENDING) — used by retry/dispatch job */
    List<Notification> findByStatus(String status);

    /** Notifications for a CRM customer */
    List<Notification> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    /** Count of unread notifications per user */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.status = 'SENT'")
    long countUnreadByUserId(@Param("userId") Long userId);
}
