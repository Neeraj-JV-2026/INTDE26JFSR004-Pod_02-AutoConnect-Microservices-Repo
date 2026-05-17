package com.cognizant.sales_service.controller;

import com.cognizant.sales_service.entity.TestDrive;
import com.cognizant.sales_service.service.TestDriveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sales/test-drives")
@RequiredArgsConstructor
public class TestDriveController {

    private final TestDriveService testDriveService;

    @PostMapping
    public ResponseEntity<TestDrive> bookTestDrive(@RequestBody TestDrive testDrive) {
        return new ResponseEntity<>(testDriveService.bookTestDrive(testDrive), HttpStatus.CREATED);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<TestDrive>> getCustomerTestDrives(@PathVariable Long customerId) {
        return ResponseEntity.ok(testDriveService.getCustomerTestDrives(customerId));
    }

    @GetMapping
    public ResponseEntity<List<TestDrive>> getAllTestDrives() {
        return ResponseEntity.ok(testDriveService.getAllTestDrives());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TestDrive> updateStatus(@PathVariable Long id, @RequestParam TestDrive.TestDriveStatus status) {
        return ResponseEntity.ok(testDriveService.updateStatus(id, status));
    }
}
