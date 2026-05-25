package com.cognizant.finance_service.repository;

import com.cognizant.finance_service.entity.KPI;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KPIRepository extends JpaRepository<KPI, Long> {
}
