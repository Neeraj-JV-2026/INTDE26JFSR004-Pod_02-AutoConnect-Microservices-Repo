package com.cognizant.sales_service.client;

import com.cognizant.sales_service.dto.AvailabilityRequest;
import com.cognizant.sales_service.dto.AvailabilityResponse;
import com.cognizant.sales_service.dto.PricingRequest;
import com.cognizant.sales_service.dto.PricingResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "inventory-service")
public interface InventoryFeignClient {

    @GetMapping("/api/inventory/vehicles/{id}")
    Object getVehicle(@RequestHeader("Authorization") String token, @PathVariable("id") Long id);

    @PostMapping("/api/inventory/check-availability")
    AvailabilityResponse checkAvailability(@RequestHeader("Authorization") String token, @RequestBody AvailabilityRequest request);

    @PostMapping("/api/inventory/pricing/calculate")
    PricingResponse calculatePricing(@RequestHeader("Authorization") String token, @RequestBody PricingRequest request);
    
    @PostMapping("/api/inventory/vehicles/{id}/mark-sold")
    Object markSold(@RequestHeader("Authorization") String token, @PathVariable("id") Long id);

    @PostMapping("/api/inventory/vehicles/{id}/mark-available")
    Object markAvailable(@RequestHeader("Authorization") String token, @PathVariable("id") Long id);
}
