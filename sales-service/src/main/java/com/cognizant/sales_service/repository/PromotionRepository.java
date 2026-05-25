package com.cognizant.sales_service.repository;

import com.cognizant.sales_service.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    Optional<Promotion> findByCodeAndIsActiveTrue(String code);
}
