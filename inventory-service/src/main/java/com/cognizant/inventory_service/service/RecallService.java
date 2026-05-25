package com.cognizant.inventory_service.service;

import com.cognizant.inventory_service.client.NotificationFeignClient;
import com.cognizant.inventory_service.dto.NotificationRequestDTO;
import com.cognizant.inventory_service.entity.Recall;
import com.cognizant.inventory_service.repository.RecallRepository;
import com.cognizant.inventory_service.security.SecurityUtils;
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
    private final NotificationFeignClient notificationClient;
    private final SecurityUtils securityUtils;

    public Recall createRecall(Recall recall) {
        Recall saved = recallRepository.save(recall);
        triggerRecallNotification(saved);
        return saved;
    }

    private void triggerRecallNotification(Recall recall) {
        try {
            String token = securityUtils.getCurrentJwtToken();
            // Notify admin (userId=1) of the new recall — in production this would be bulk to all affected customers
            notificationClient.sendNotification("Bearer " + token, NotificationRequestDTO.builder()
                    .userId(1L)
                    .channel("EMAIL")
                    .notificationType("RECALL_ALERT")
                    .subject("SAFETY RECALL: " + recall.getAffectedModels())
                    .message("A new safety recall has been issued. Affected models: "
                            + recall.getAffectedModels()
                            + ". Description: " + recall.getDescription()
                            + ". Recall ID: " + recall.getRecallId() + ". Please contact affected customers immediately.")
                    .build());
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
