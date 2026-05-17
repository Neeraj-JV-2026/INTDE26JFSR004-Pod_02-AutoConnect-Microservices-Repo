package com.cognizant.customer_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "interactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Interaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long interactionId;

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private Long userId; // Sales representative

    private String channel; // Call/Email/SMS
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    private LocalDateTime timestamp;
    private String outcome;

    @PrePersist
    public void prePersist() {
        if (timestamp == null) timestamp = LocalDateTime.now();
    }
}
