package com.cognizant.finance_service.repository;

import com.cognizant.finance_service.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByScope(Report.ReportScope scope);
    List<Report> findByGeneratedByOrderByGeneratedAtDesc(Long generatedBy);
    List<Report> findByScopeOrderByGeneratedAtDesc(Report.ReportScope scope);
}
