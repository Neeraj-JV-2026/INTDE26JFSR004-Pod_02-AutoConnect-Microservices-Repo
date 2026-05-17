package com.cognizant.serviceparts.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import java.util.Map;

@FeignClient(name = "inventory-service")
public interface InventoryFeignClient {

    @GetMapping("/api/v1/inventory/vehicles/{id}")
    Map<String, Object> getVehicleById(
            @PathVariable("id") Long vehicleId,
            @RequestHeader("Authorization") String token);

    @GetMapping("/api/v1/inventory/parts/{id}")
    com.cognizant.serviceparts.dto.PartDTO getPartById(
            @PathVariable("id") Long id,
            @RequestHeader("Authorization") String token);

    @PostMapping("/api/v1/inventory/parts/{id}/reserve")
    Map<String, Object> reservePart(
            @PathVariable("id") Long id,
            @RequestBody com.cognizant.serviceparts.dto.PartReserveRequest request,
            @RequestHeader("Authorization") String token);

    @PostMapping("/api/v1/inventory/parts/{id}/consume")
    Map<String, Object> consumePart(
            @PathVariable("id") Long id,
            @RequestBody com.cognizant.serviceparts.dto.PartConsumeRequest request,
            @RequestHeader("Authorization") String token);

    @GetMapping("/api/v1/inventory/warranties/{id}")
    Map<String, Object> getWarrantyById(
            @PathVariable("id") Long id,
            @RequestHeader("Authorization") String token);
}
