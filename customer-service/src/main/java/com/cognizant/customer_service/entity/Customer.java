package com.cognizant.customer_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long customerId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String contactInfo;

    private Long preferredDealerId;

    @Column(columnDefinition = "TEXT")
    private String vehicleOwnershipDetails;

    private String loyaltyTier;
    private String status;
    private LocalDateTime createdAt;

    /** IAM user-service userId — populated during self-registration to link accounts */
    private Long userId;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
