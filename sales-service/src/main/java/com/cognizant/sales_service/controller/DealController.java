package com.cognizant.sales_service.controller;

import com.cognizant.sales_service.entity.Deal;
import com.cognizant.sales_service.service.DealService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales/deals")
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;

    @PostMapping
    public ResponseEntity<Deal> createDeal(@RequestBody Deal deal) {
        return ResponseEntity.ok(dealService.createDeal(deal));
    }

    @GetMapping
    public ResponseEntity<List<Deal>> getAllDeals() {
        return ResponseEntity.ok(dealService.getAllDeals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Deal> getDeal(@PathVariable Long id) {
        return ResponseEntity.ok(dealService.getDeal(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Deal> updateDeal(@PathVariable Long id, @RequestBody Deal deal) {
        return ResponseEntity.ok(dealService.updateDeal(id, deal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeal(@PathVariable Long id) {
        dealService.deleteDeal(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Deal> approveDeal(@PathVariable Long id) {
        return ResponseEntity.ok(dealService.approveDeal(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Deal> rejectDeal(@PathVariable Long id) {
        return ResponseEntity.ok(dealService.rejectDeal(id));
    }

    @PostMapping("/{id}/finalize")
    public ResponseEntity<Deal> finalizeDeal(@PathVariable Long id) {
        return ResponseEntity.ok(dealService.finalizeDeal(id));
    }
}
