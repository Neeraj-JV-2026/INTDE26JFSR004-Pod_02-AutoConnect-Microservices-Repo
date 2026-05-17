package com.cognizant.finance_service.repository;

import com.cognizant.finance_service.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInvoiceId(Long invoiceId);
    List<Payment> findByInvoiceIdOrderByPaidAtDesc(Long invoiceId);
    List<Payment> findByStatus(String status);
    boolean existsByTransactionReference(String transactionReference);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paidAt BETWEEN :start AND :end AND p.status = 'SUCCESS'")
    BigDecimal sumAmountByPaidAtBetween(@Param("start") LocalDateTime start,
                                        @Param("end") LocalDateTime end);
}
