package com.cognizant.inventory_service.controller;

import com.cognizant.inventory_service.entity.Recall;
import com.cognizant.inventory_service.service.RecallService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/recalls")
@RequiredArgsConstructor
public class RecallController {

    private final RecallService recallService;

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Recall> createRecall(@RequestBody Recall recall) {
        return new ResponseEntity<>(recallService.createRecall(recall), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Recall>> getAllRecalls() {
        return ResponseEntity.ok(recallService.getAllRecalls());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Recall>> getActiveRecalls() {
        return ResponseEntity.ok(recallService.getActiveRecalls());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recall> getRecallById(@PathVariable Long id) {
        return ResponseEntity.ok(recallService.getRecallById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Recall> updateStatus(
            @PathVariable Long id, 
            @RequestParam Recall.RecallStatus status) {
        return ResponseEntity.ok(recallService.updateRecallStatus(id, status));
    }
}
