package com.cognizant.inventory_service.controller;

import com.cognizant.inventory_service.dto.AvailabilityRequest;
import com.cognizant.inventory_service.dto.AvailabilityResponse;
import com.cognizant.inventory_service.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/check-availability")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_CONSULTANT', 'SERVICE_ADVISOR', 'INVENTORY_MANAGER')")
    public ResponseEntity<AvailabilityResponse> checkAvailability(@RequestBody AvailabilityRequest request) {
        boolean isAvailable = inventoryService.checkAvailability(request.getVehicleId());
        return ResponseEntity.ok(new AvailabilityResponse(isAvailable));
    }
}
