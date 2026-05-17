package com.cognizant.finance_service.repository;

import com.cognizant.finance_service.entity.AuditPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditPackageRepository extends JpaRepository<AuditPackage, Long> {
}
