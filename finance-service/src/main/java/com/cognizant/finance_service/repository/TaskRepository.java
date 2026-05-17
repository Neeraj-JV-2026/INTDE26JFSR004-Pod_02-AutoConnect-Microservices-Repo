package com.cognizant.finance_service.repository;

import com.cognizant.finance_service.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignedToOrderByCreatedAtDesc(Long assignedTo);
    List<Task> findByAssignedToAndStatus(Long assignedTo, String status);
    List<Task> findByRelatedEntityId(Long relatedEntityId);
    List<Task> findByStatus(String status);
}
