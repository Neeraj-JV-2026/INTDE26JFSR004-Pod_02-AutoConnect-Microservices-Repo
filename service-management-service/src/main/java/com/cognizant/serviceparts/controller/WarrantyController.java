package com.cognizant.serviceparts.controller;

import com.cognizant.serviceparts.dto.ApiResponse;
import com.cognizant.serviceparts.dto.WarrantyClaimRequest;
import com.cognizant.serviceparts.entity.WarrantyClaim;
import com.cognizant.serviceparts.service.WarrantyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/warranties")
@RequiredArgsConstructor
public class WarrantyController {

    private final WarrantyService warrantyService;

    // ─── WARRANTY CLAIMS ─────────────────────────────────────────────────────

    /**
     * GET /api/v1/warranties/claims — returns all warranty claims (for advisor review).
     */
    @GetMapping("/claims")
    public ResponseEntity<ApiResponse<List<WarrantyClaim>>> getAllClaims() {
        return ResponseEntity.ok(ApiResponse.success(warrantyService.getAllClaims()));
    }

    /**
     * POST /api/v1/service/api/v1/warranties/claims
     * Submits a new warranty claim against an active warranty.
     */
    @PostMapping("/claims")
    public ResponseEntity<ApiResponse<WarrantyClaim>> submitClaim(
            @Valid @RequestBody WarrantyClaimRequest request) {

        WarrantyClaim claim = warrantyService.submitClaim(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Warranty claim submitted successfully", claim));
    }

    /**
     * GET /api/v1/service/api/v1/warranties/claims/{claimId}
     */
    @GetMapping("/claims/{claimId}")
    public ResponseEntity<ApiResponse<WarrantyClaim>> getClaimById(@PathVariable Long claimId) {
        WarrantyClaim claim = warrantyService.getClaimById(claimId);
        return ResponseEntity.ok(ApiResponse.success(claim));
    }

    /**
     * GET /api/v1/service/api/v1/warranties/{id}/claims
     */
    @GetMapping("/{id}/claims")
    public ResponseEntity<ApiResponse<List<WarrantyClaim>>> getClaimsByWarranty(@PathVariable Long id) {
        List<WarrantyClaim> claims = warrantyService.getClaimsByWarranty(id);
        return ResponseEntity.ok(ApiResponse.success(claims));
    }

    /**
     * POST /api/v1/service/api/v1/warranties/claims/{claimId}/review
     */
    @PostMapping("/claims/{claimId}/review")
    public ResponseEntity<ApiResponse<WarrantyClaim>> reviewClaim(@PathVariable Long claimId) {
        WarrantyClaim claim = warrantyService.reviewClaim(claimId);
        return ResponseEntity.ok(ApiResponse.success("Claim is now under review", claim));
    }

    /**
     * POST /api/v1/service/api/v1/warranties/claims/{claimId}/approve
     */
    @PostMapping("/claims/{claimId}/approve")
    public ResponseEntity<ApiResponse<WarrantyClaim>> approveClaim(
            @PathVariable Long claimId,
            @RequestParam BigDecimal approvedAmount) {

        WarrantyClaim claim = warrantyService.approveClaim(claimId, approvedAmount);
        return ResponseEntity.ok(ApiResponse.success("Claim approved successfully", claim));
    }

    /**
     * POST /api/v1/service/api/v1/warranties/claims/{claimId}/reject
     */
    @PostMapping("/claims/{claimId}/reject")
    public ResponseEntity<ApiResponse<WarrantyClaim>> rejectClaim(
            @PathVariable Long claimId,
            @RequestParam String reason) {

        WarrantyClaim claim = warrantyService.rejectClaim(claimId, reason);
        return ResponseEntity.ok(ApiResponse.success("Claim rejected", claim));
    }
}