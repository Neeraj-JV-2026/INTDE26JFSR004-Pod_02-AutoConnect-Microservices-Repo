package com.cognizant.serviceparts.service;

import com.cognizant.serviceparts.client.InventoryFeignClient;
import com.cognizant.serviceparts.dto.PartConsumeRequest;
import com.cognizant.serviceparts.dto.PartDTO;
import com.cognizant.serviceparts.entity.JobCard;
import com.cognizant.serviceparts.entity.PartConsumption;
import com.cognizant.serviceparts.exception.ResourceNotFoundException;
import com.cognizant.serviceparts.repository.JobCardRepository;
import com.cognizant.serviceparts.repository.PartConsumptionRepository;
import com.cognizant.serviceparts.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PartsManagement {

    private final InventoryFeignClient inventoryFeignClient;
    private final PartConsumptionRepository partConsumptionRepository;
    private final JobCardRepository jobCardRepository;
    private final SecurityUtils securityUtils;

    public PartConsumption consumePart(Long partId, PartConsumeRequest request) {
        String token = securityUtils.getCurrentJwtToken();

        // 1. Validate part exists in inventory-service
        PartDTO part = inventoryFeignClient.getPartById(partId, token);

        // 2. Validate job card is IN_PROGRESS
        JobCard jobCard = jobCardRepository.findById(request.getJobCardId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "JobCard", "id", request.getJobCardId()));

        if (jobCard.getStatus() != JobCard.JobCardStatus.IN_PROGRESS) {
            throw new RuntimeException(
                    "Parts can only be consumed for an IN_PROGRESS Job Card. Current status: "
                    + jobCard.getStatus());
        }

        // 3. Reduce stock in inventory-service — this is the authoritative stock update
        PartConsumeRequest inventoryConsumeRequest = PartConsumeRequest.builder()
                .quantity(request.getQuantity())
                .jobCardId(request.getJobCardId())
                .locationId(request.getLocationId())
                .build();
        inventoryFeignClient.consumePart(partId, inventoryConsumeRequest, token);
        log.info("Stock reduced in inventory-service: {} units of part {} at location {}",
                request.getQuantity(), partId, request.getLocationId());

        // 4. Record consumption locally
        Long consumedBy = securityUtils.getCurrentUserId();
        PartConsumption consumption = PartConsumption.builder()
                .partId(partId)
                .jobCard(jobCard)
                .quantity(request.getQuantity())
                .consumedBy(consumedBy)
                .build();

        log.info("Consumed {} units of Part ID {} for Job Card ID {}",
                request.getQuantity(), partId, request.getJobCardId());

        return partConsumptionRepository.save(consumption);
    }

    @Transactional(readOnly = true)
    public List<PartConsumption> getConsumptionsByJobCard(Long jobCardId) {
        return partConsumptionRepository.findByJobCard_JobId(jobCardId);
    }

    @Transactional(readOnly = true)
    public List<PartConsumption> getConsumptionsByPart(Long partId) {
        return partConsumptionRepository.findByPartId(partId);
    }
}
