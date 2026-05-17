package com.cognizant.serviceparts.repository;

import com.cognizant.serviceparts.entity.WarrantyClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WarrantyClaimRepository extends JpaRepository<WarrantyClaim, Long> {

    List<WarrantyClaim> findByWarrantyId(Long warrantyId);

    List<WarrantyClaim> findByStatus(WarrantyClaim.ClaimStatus status);

    List<WarrantyClaim> findByJobCard_JobId(Long jobId);
}