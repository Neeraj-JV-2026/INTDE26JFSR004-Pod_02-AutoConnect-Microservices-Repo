package com.cognizant.inventory_service.repository;

import com.cognizant.inventory_service.entity.Recall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecallRepository extends JpaRepository<Recall, Long> {

    Optional<Recall> findByRecallNumber(String recallNumber);

    List<Recall> findByStatus(Recall.RecallStatus status);

    List<Recall> findByAffectedModelsContaining(String model);
}
