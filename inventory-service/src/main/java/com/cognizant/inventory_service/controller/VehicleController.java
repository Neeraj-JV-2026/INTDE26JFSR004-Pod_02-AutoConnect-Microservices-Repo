package com.cognizant.inventory_service.controller;

import com.cognizant.inventory_service.dto.VehicleRequestDTO;
import com.cognizant.inventory_service.dto.VehicleResponseDTO;
import com.cognizant.inventory_service.entity.Vehicle;
import com.cognizant.inventory_service.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final InventoryService inventoryService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<VehicleResponseDTO> addVehicle(@Valid @RequestBody VehicleRequestDTO dto) {
        return new ResponseEntity<>(mapToResponse(inventoryService.addVehicle(mapToEntity(dto))), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INVENTORY_MANAGER', 'SALES_CONSULTANT', 'AUDITOR')")
    public ResponseEntity<List<VehicleResponseDTO>> getAllVehicles() {
        List<VehicleResponseDTO> list = inventoryService.getAllVehicles()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INVENTORY_MANAGER', 'SALES_CONSULTANT', 'AUDITOR')")
    public ResponseEntity<VehicleResponseDTO> getVehicle(@PathVariable Long id) {
        return ResponseEntity.ok(mapToResponse(inventoryService.getVehicle(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<VehicleResponseDTO> updateVehicle(@PathVariable Long id,
                                                            @Valid @RequestBody VehicleRequestDTO dto) {
        return ResponseEntity.ok(mapToResponse(inventoryService.updateVehicle(id, mapToEntity(dto))));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        inventoryService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    // Spec: POST /vehicles/{id}/mark-available
    @PostMapping("/{id}/mark-available")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<VehicleResponseDTO> markAvailable(@PathVariable Long id) {
        return ResponseEntity.ok(mapToResponse(inventoryService.markAvailable(id)));
    }

    // Spec: POST /vehicles/{id}/mark-sold
    @PostMapping("/{id}/mark-sold")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_CONSULTANT')")
    public ResponseEntity<VehicleResponseDTO> markSold(@PathVariable Long id) {
        return ResponseEntity.ok(mapToResponse(inventoryService.markSold(id)));
    }

    // ── mapping helpers ──

    private Vehicle mapToEntity(VehicleRequestDTO dto) {
        Vehicle v = new Vehicle();
        v.setVin(dto.getVin());
        v.setStockNumber(dto.getStockNumber());
        v.setMake(dto.getMake());
        v.setModel(dto.getModel());
        v.setYear(dto.getYear());
        v.setTrim(dto.getTrim());
        v.setColor(dto.getColor());
        v.setMileage(dto.getMileage());
        v.setConditionType(dto.getConditionType());
        v.setLocationId(dto.getLocationId());
        v.setBasePrice(dto.getBasePrice());
        v.setMsrp(dto.getMsrp());
        return v;
    }

    private VehicleResponseDTO mapToResponse(Vehicle v) {
        return VehicleResponseDTO.builder()
                .vehicleId(v.getVehicleId())
                .vin(v.getVin())
                .stockNumber(v.getStockNumber())
                .make(v.getMake())
                .model(v.getModel())
                .year(v.getYear())
                .trim(v.getTrim())
                .color(v.getColor())
                .mileage(v.getMileage())
                .conditionType(v.getConditionType())
                .locationId(v.getLocationId())
                .status(v.getStatus())
                .basePrice(v.getBasePrice())
                .msrp(v.getMsrp())
                .createdAt(v.getCreatedAt())
                .build();
    }
}
