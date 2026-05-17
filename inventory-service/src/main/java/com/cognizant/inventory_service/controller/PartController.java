package com.cognizant.inventory_service.controller;

import com.cognizant.inventory_service.dto.PartConsumeRequest;
import com.cognizant.inventory_service.dto.PartInventoryRequest;
import com.cognizant.inventory_service.dto.PartRequest;
import com.cognizant.inventory_service.dto.PartReserveRequest;
import com.cognizant.inventory_service.entity.Part;
import com.cognizant.inventory_service.entity.PartInventory;
import com.cognizant.inventory_service.service.PartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/parts")
@RequiredArgsConstructor
public class PartController {

    private final PartService partService;

    @PostMapping
    public ResponseEntity<Part> createPart(@Valid @RequestBody PartRequest request) {
        return new ResponseEntity<>(partService.createPart(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Part>> getAllParts() {
        return ResponseEntity.ok(partService.getAllParts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Part> getPartById(@PathVariable Long id) {
        return ResponseEntity.ok(partService.getPartById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Part> updatePart(@PathVariable Long id, @Valid @RequestBody PartRequest request) {
        return ResponseEntity.ok(partService.updatePart(id, request));
    }

    @PostMapping("/inventory")
    public ResponseEntity<PartInventory> createInventory(@Valid @RequestBody PartInventoryRequest request) {
        return new ResponseEntity<>(partService.createInventory(request), HttpStatus.CREATED);
    }

    @GetMapping("/inventory")
    public ResponseEntity<List<PartInventory>> getAllInventory() {
        return ResponseEntity.ok(partService.getAllInventory());
    }

    @PostMapping("/{id}/reserve")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PARTS_MANAGER', 'TECHNICIAN', 'SERVICE_ADVISOR')")
    public ResponseEntity<PartInventory> reservePart(@PathVariable Long id, @Valid @RequestBody PartReserveRequest request) {
        return ResponseEntity.ok(partService.reservePart(id, request));
    }

    @PostMapping("/{id}/consume")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PARTS_MANAGER', 'TECHNICIAN', 'SERVICE_ADVISOR')")
    public ResponseEntity<PartInventory> consumePart(@PathVariable Long id,
                                                     @Valid @RequestBody PartConsumeRequest request) {
        return ResponseEntity.ok(partService.consumePart(id, request.getLocationId(), request.getQuantity()));
    }
}
