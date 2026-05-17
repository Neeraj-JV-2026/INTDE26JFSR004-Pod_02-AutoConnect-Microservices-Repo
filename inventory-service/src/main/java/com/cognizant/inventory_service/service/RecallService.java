package com.cognizant.inventory_service.service;

import com.cognizant.inventory_service.entity.Recall;
import com.cognizant.inventory_service.repository.RecallRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RecallService {

    private final RecallRepository recallRepository;
    private final com.cognizant.inventory_service.client.FinanceFeignClient financeClient;

    public Recall createRecall(Recall recall) {
        Recall saved = recallRepository.save(recall);
        triggerRecallNotification(saved);
        return saved;
    }

    private void triggerRecallNotification(Recall recall) {
        try {
            com.cognizant.inventory_service.dto.NotificationRequestDTO notification = 
                com.cognizant.inventory_service.dto.NotificationRequestDTO.builder()
                    .userId(1L) // Global Admin/Manager
                    .relatedEntityId(recall.getRecallId())
                    .message("SAFETY RECALL: New recall issued for model " + recall.getAffectedModels() + 
                             ". Description: " + recall.getDescription())
                    .category("RECALL")
                    .severity("WARNING")
                    .build();
            financeClient.sendNotification(null, notification);
            log.info("Recall notification triggered for recall ID: {}", recall.getRecallId());
        } catch (Exception e) {
            log.error("Failed to send recall notification", e);
        }
    }

    @Transactional(readOnly = true)
    public List<Recall> getAllRecalls() {
        return recallRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Recall getRecallById(Long id) {
        return recallRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recall not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Recall> getActiveRecalls() {
        return recallRepository.findByStatus(Recall.RecallStatus.ACTIVE);
    }

    public Recall updateRecallStatus(Long id, Recall.RecallStatus status) {
        Recall recall = getRecallById(id);
        recall.setStatus(status);
        return recallRepository.save(recall);
    }
}
