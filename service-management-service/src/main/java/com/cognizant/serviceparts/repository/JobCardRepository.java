package com.cognizant.serviceparts.repository;

import com.cognizant.serviceparts.entity.JobCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobCardRepository extends JpaRepository<JobCard, Long> {

    Optional<JobCard> findByWorkOrder_WoId(Long woId);

    List<JobCard> findByTechnicianId(Long technicianId);

    List<JobCard> findByStatus(JobCard.JobCardStatus status);
}