package com.cognizant.inventory_service.controller;

import com.cognizant.inventory_service.dto.WarrantyRequest;
import com.cognizant.inventory_service.entity.Warranty;
import com.cognizant.inventory_service.service.WarrantyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/warranties")
@RequiredArgsConstructor
public class WarrantyController {

    private final WarrantyService warrantyService;

    @PostMapping
    public ResponseEntity<Warranty> createWarranty(@Valid @RequestBody WarrantyRequest request) {
        return new ResponseEntity<>(warrantyService.createWarranty(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Warranty>> getAllWarranties() {
        return ResponseEntity.ok(warrantyService.getAllWarranties());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Warranty> getWarrantyById(@PathVariable Long id) {
        return ResponseEntity.ok(warrantyService.getWarrantyById(id));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<Warranty>> getByVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(warrantyService.getWarrantiesByVehicle(vehicleId));
    }

    @GetMapping("/vehicle/{vehicleId}/check")
    public ResponseEntity<Boolean> checkActiveWarranty(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(warrantyService.isVehicleUnderWarranty(vehicleId));
    }
}
