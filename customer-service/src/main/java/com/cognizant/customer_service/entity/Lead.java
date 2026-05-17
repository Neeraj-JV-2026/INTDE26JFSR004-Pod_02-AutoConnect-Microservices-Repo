package com.cognizant.customer_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "leads")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lead {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long leadId;

    @Column(nullable = false)
    private Long customerId;

    private String source;
    private String interestedModel;
    
    // NEW, CONTACTED, INTERESTED, CONVERTED, CLOSED
    private String status;
    
    private Long assignedTo; // Sales Representative (User ID)
    private LocalDateTime createdAt;
    
    @Column(columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "NEW";
    }
}
