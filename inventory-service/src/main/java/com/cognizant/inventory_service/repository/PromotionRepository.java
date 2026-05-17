package com.cognizant.inventory_service.repository;

import com.cognizant.inventory_service.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    Optional<Promotion> findByCode(String code);

    // Fetch promotions that are ACTIVE, within date range, and still have usage left
    @Query("SELECT p FROM Promotion p WHERE p.status = 'ACTIVE' " +
           "AND p.startAt <= :now AND p.endAt >= :now " +
           "AND (p.usageLimit IS NULL OR p.usageLimit > 0)")
    List<Promotion> findAllActivePromotions(@Param("now") LocalDateTime now);
}
