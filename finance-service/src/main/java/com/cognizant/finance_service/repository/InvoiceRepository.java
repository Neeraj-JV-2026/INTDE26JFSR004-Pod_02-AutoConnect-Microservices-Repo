package com.cognizant.finance_service.repository;

import com.cognizant.finance_service.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByCustomerId(Long customerId);
    List<Invoice> findByStatus(String status);
    List<Invoice> findByCustomerIdAndStatus(Long customerId, String status);
    List<Invoice> findByRelatedEntityTypeAndRelatedEntityId(String entityType, Long entityId);
    boolean existsByInvoiceIdAndStatus(Long invoiceId, String status);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.issuedAt BETWEEN :start AND :end")
    long countByIssuedAtBetween(@Param("start") LocalDateTime start,
                                @Param("end") LocalDateTime end);
}
