package com.cognizant.sales_service.controller;

import com.cognizant.sales_service.entity.Quote;
import com.cognizant.sales_service.service.SalesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales/quotes")
@RequiredArgsConstructor
public class QuoteController {

    private final SalesService salesService;

    @PostMapping
    public ResponseEntity<Quote> createQuote(@RequestBody Quote quote) {
        return ResponseEntity.ok(salesService.createQuote(quote));
    }

    @GetMapping
    public ResponseEntity<List<Quote>> getAllQuotes() {
        return ResponseEntity.ok(salesService.getAllQuotes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quote> getQuote(@PathVariable Long id) {
        return ResponseEntity.ok(salesService.getQuote(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quote> updateQuote(@PathVariable Long id, @RequestBody Quote quote) {
        return ResponseEntity.ok(salesService.updateQuote(id, quote));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuote(@PathVariable Long id) {
        salesService.deleteQuote(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/generate")
    public ResponseEntity<Quote> generateQuote(@PathVariable Long id) {
        return ResponseEntity.ok(salesService.generateQuote(id));
    }

    @PostMapping("/{id}/expire")
    public ResponseEntity<Quote> expireQuote(@PathVariable Long id) {
        return ResponseEntity.ok(salesService.expireQuote(id));
    }

    @PostMapping("/{id}/apply-promo")
    public ResponseEntity<Quote> applyPromo(@PathVariable Long id, @RequestParam String code) {
        return ResponseEntity.ok(salesService.applyPromoCode(id, code));
    }
}
