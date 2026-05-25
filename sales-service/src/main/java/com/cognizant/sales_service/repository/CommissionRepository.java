package com.cognizant.sales_service.repository;

import com.cognizant.sales_service.entity.Commission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommissionRepository extends JpaRepository<Commission, Long> {
    List<Commission> findBySalesPersonId(Long salesPersonId);
}
