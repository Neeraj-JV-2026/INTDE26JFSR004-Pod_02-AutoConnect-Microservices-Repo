package com.cognizant.sales_service.repository;

import com.cognizant.sales_service.entity.TestDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TestDriveRepository extends JpaRepository<TestDrive, Long> {
    List<TestDrive> findByCustomerId(Long customerId);
    List<TestDrive> findBySalesPersonId(Long salesPersonId);
}
