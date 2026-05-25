package com.cognizant.inventory_service.repository;

import com.cognizant.inventory_service.entity.PriceRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PriceRuleRepository extends JpaRepository<PriceRule, Long> {

    // Fetch rules that are ACTIVE and whose date range covers right now, ordered by priority
    List<PriceRule> findByStatusAndEffectiveFromBeforeAndEffectiveToAfterOrderByPriorityDesc(
            String status, LocalDateTime now1, LocalDateTime now2);
}
