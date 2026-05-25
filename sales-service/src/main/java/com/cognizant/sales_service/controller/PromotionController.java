package com.cognizant.sales_service.controller;

import com.cognizant.sales_service.entity.Promotion;
import com.cognizant.sales_service.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sales/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_MANAGER', 'SALES_AGENT')")
    public ResponseEntity<Promotion> createPromotion(@RequestBody Promotion promotion) {
        return new ResponseEntity<>(promotionService.createPromotion(promotion), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Promotion>> getAllPromotions() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    @GetMapping("/validate/{code}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Promotion> validateCode(@PathVariable String code) {
        return promotionService.validatePromoCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_MANAGER')")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        promotionService.deactivatePromotion(id);
        return ResponseEntity.noContent().build();
    }
}
