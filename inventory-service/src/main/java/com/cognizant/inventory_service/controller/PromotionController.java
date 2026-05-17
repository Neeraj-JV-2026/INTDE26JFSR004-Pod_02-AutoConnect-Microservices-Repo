package com.cognizant.inventory_service.controller;

import com.cognizant.inventory_service.entity.Promotion;
import com.cognizant.inventory_service.service.PricingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CRUD for promotions + apply endpoint.
 * Promotions define discounts subtracted from the adjusted price.
 * Example: 2% off for all vehicles in January.
 */
@RestController
@RequestMapping("/api/inventory/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PricingService pricingService;

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Promotion> addPromotion(@Valid @RequestBody Promotion promotion) {
        return new ResponseEntity<>(pricingService.addPromotion(promotion), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INVENTORY_MANAGER', 'SALES_CONSULTANT', 'AUDITOR')")
    public ResponseEntity<List<Promotion>> getAllPromotions() {
        return ResponseEntity.ok(pricingService.getAllPromotions());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INVENTORY_MANAGER', 'SALES_CONSULTANT', 'AUDITOR')")
    public ResponseEntity<Promotion> getPromotion(@PathVariable Long id) {
        return ResponseEntity.ok(pricingService.getPromotion(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Promotion> updatePromotion(@PathVariable Long id, @RequestBody Promotion promotion) {
        return ResponseEntity.ok(pricingService.updatePromotion(id, promotion));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deletePromotion(@PathVariable Long id) {
        pricingService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }

    // Spec: POST /promotions/{id}/apply — validates and decrements usage limit
    @PostMapping("/{id}/apply")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_CONSULTANT')")
    public ResponseEntity<Promotion> applyPromotion(@PathVariable Long id) {
        return ResponseEntity.ok(pricingService.applyPromotion(id));
    }
}
