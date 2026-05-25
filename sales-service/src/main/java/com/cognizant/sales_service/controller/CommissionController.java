package com.cognizant.sales_service.controller;

import com.cognizant.sales_service.entity.Commission;
import com.cognizant.sales_service.service.CommissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales/commissions")
@RequiredArgsConstructor
public class CommissionController {

    private final CommissionService commissionService;

    @GetMapping
    public ResponseEntity<List<Commission>> getAllCommissions() {
        return ResponseEntity.ok(commissionService.getAllCommissions());
    }

    @GetMapping("/salesperson/{salesPersonId}")
    public ResponseEntity<List<Commission>> getBySalesPerson(@PathVariable Long salesPersonId) {
        return ResponseEntity.ok(commissionService.getCommissionsBySalesPerson(salesPersonId));
    }

    @PostMapping("/calculate")
    public ResponseEntity<Commission> calculateCommission(@RequestParam Long dealId) {
        return ResponseEntity.ok(commissionService.calculateCommission(dealId));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<Commission> markPaid(@PathVariable Long id) {
        return ResponseEntity.ok(commissionService.markPaid(id));
    }
}
