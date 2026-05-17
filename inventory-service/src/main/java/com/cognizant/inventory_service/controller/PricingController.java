package com.cognizant.inventory_service.controller;

import com.cognizant.inventory_service.dto.PricingRequest;
import com.cognizant.inventory_service.dto.PricingResponse;
import com.cognizant.inventory_service.service.PricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Called by Sales Service to calculate the final vehicle price.
 *
 * POST /api/inventory/pricing/calculate
 * Request:  { "vehicleId": 101, "customerId": 55 }
 * Response: { "basePrice": 1000000, "adjustments": 50000, "discounts": 20000, "finalPrice": 1030000 }
 */
@RestController
@RequestMapping("/api/inventory/pricing")
@RequiredArgsConstructor
public class PricingController {

    private final PricingService pricingService;

    @PostMapping("/calculate")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_CONSULTANT', 'INVENTORY_MANAGER')")
    public ResponseEntity<PricingResponse> calculatePricing(@RequestBody PricingRequest request) {
        return ResponseEntity.ok(pricingService.calculatePricing(request));
    }
}
