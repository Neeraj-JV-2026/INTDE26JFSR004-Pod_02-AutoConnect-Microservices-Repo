package com.cognizant.serviceparts.service;

import com.cognizant.serviceparts.client.InventoryFeignClient;
import com.cognizant.serviceparts.dto.WarrantyClaimRequest;
import com.cognizant.serviceparts.entity.JobCard;
import com.cognizant.serviceparts.entity.WarrantyClaim;
import com.cognizant.serviceparts.exception.ResourceNotFoundException;
import com.cognizant.serviceparts.repository.JobCardRepository;
import com.cognizant.serviceparts.repository.WarrantyClaimRepository;
import com.cognizant.serviceparts.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WarrantyService {

    private final InventoryFeignClient inventoryFeignClient;
    private final WarrantyClaimRepository warrantyClaimRepository;
    private final JobCardRepository jobCardRepository;
    private final SecurityUtils securityUtils;

    /**
     * Business API: submit a claim against a warranty owned by Inventory Service.
     */
    public WarrantyClaim submitClaim(WarrantyClaimRequest request) {
        String token = securityUtils.getCurrentJwtToken();

        // 1. Validate Warranty exists and is active in Inventory Service via Feign
        Map<String, Object> warranty = inventoryFeignClient.getWarrantyById(request.getWarrantyId(), token);
        
        if (!"ACTIVE".equals(warranty.get("status"))) {
            throw new RuntimeException("Claim can only be submitted against an ACTIVE warranty.");
        }

        // 2. Optionally link to a Job Card
        JobCard jobCard = null;
        if (request.getJobCardId() != null) {
            jobCard = jobCardRepository.findById(request.getJobCardId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "JobCard", "id", request.getJobCardId()));
        }

        WarrantyClaim claim = WarrantyClaim.builder()
                .warrantyId(request.getWarrantyId())
                .jobCard(jobCard)
                .claimDescription(request.getClaimDescription())
                .claimAmount(request.getClaimAmount())
                .status(WarrantyClaim.ClaimStatus.SUBMITTED)
                .build();

        log.info("Warranty claim submitted for Warranty ID: {}", request.getWarrantyId());
        return warrantyClaimRepository.save(claim);
    }

    @Transactional(readOnly = true)
    public WarrantyClaim getClaimById(Long claimId) {
        return warrantyClaimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", claimId));
    }

    @Transactional(readOnly = true)
    public List<WarrantyClaim> getClaimsByWarranty(Long warrantyId) {
        return warrantyClaimRepository.findByWarrantyId(warrantyId);
    }

    public WarrantyClaim approveClaim(Long claimId, BigDecimal approvedAmount) {
        WarrantyClaim claim = getClaimById(claimId);
        Long approverId = securityUtils.getCurrentUserId();

        claim.setApprovedAmount(approvedAmount);
        claim.setApprovedBy(approverId);
        claim.setApprovedAt(LocalDateTime.now());
        claim.setStatus(WarrantyClaim.ClaimStatus.APPROVED);

        return warrantyClaimRepository.save(claim);
    }

    public WarrantyClaim rejectClaim(Long claimId, String rejectionReason) {
        WarrantyClaim claim = getClaimById(claimId);
        claim.setRejectionReason(rejectionReason);
        claim.setStatus(WarrantyClaim.ClaimStatus.REJECTED);
        return warrantyClaimRepository.save(claim);
    }

    public WarrantyClaim reviewClaim(Long claimId) {
        WarrantyClaim claim = getClaimById(claimId);
        claim.setStatus(WarrantyClaim.ClaimStatus.UNDER_REVIEW);
        return warrantyClaimRepository.save(claim);
    }
}