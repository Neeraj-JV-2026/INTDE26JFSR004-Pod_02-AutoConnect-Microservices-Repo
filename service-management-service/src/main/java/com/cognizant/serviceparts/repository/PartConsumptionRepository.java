package com.cognizant.serviceparts.repository;

import com.cognizant.serviceparts.entity.PartConsumption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PartConsumptionRepository extends JpaRepository<PartConsumption, Long> {

    List<PartConsumption> findByJobCard_JobId(Long jobId);

    List<PartConsumption> findByPartId(Long partId);
}