package com.cognizant.inventory_service.controller;

import com.cognizant.inventory_service.entity.PriceRule;
import com.cognizant.inventory_service.service.PricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CRUD for pricing rules.
 * Rules define adjustments added on top of the base price.
 * Example rule: add 5% for new vehicles from Toyota.
 */
@RestController
@RequestMapping("/api/inventory/pricing/rules")
@RequiredArgsConstructor
public class PricingRuleController {

    private final PricingService pricingService;

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PriceRule> addPriceRule(@RequestBody PriceRule rule) {
        return new ResponseEntity<>(pricingService.addPriceRule(rule), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INVENTORY_MANAGER', 'AUDITOR')")
    public ResponseEntity<List<PriceRule>> getAllPriceRules() {
        return ResponseEntity.ok(pricingService.getAllPriceRules());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INVENTORY_MANAGER', 'AUDITOR')")
    public ResponseEntity<PriceRule> getPriceRule(@PathVariable Long id) {
        return ResponseEntity.ok(pricingService.getPriceRule(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PriceRule> updatePriceRule(@PathVariable Long id, @RequestBody PriceRule rule) {
        return ResponseEntity.ok(pricingService.updatePriceRule(id, rule));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deletePriceRule(@PathVariable Long id) {
        pricingService.deletePriceRule(id);
        return ResponseEntity.noContent().build();
    }
}
