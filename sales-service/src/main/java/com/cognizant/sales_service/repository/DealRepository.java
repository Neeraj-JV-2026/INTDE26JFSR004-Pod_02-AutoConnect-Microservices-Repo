package com.cognizant.sales_service.repository;

import com.cognizant.sales_service.entity.Deal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DealRepository extends JpaRepository<Deal, Long> {
    Optional<Deal> findByQuoteId(Long quoteId);
}
