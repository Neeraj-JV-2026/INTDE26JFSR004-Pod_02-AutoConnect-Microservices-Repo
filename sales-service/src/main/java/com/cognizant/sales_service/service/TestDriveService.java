package com.cognizant.sales_service.service;

import com.cognizant.sales_service.entity.TestDrive;
import com.cognizant.sales_service.exception.ResourceNotFoundException;
import com.cognizant.sales_service.repository.TestDriveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TestDriveService {

    private final TestDriveRepository testDriveRepository;

    public TestDrive bookTestDrive(TestDrive testDrive) {
        return testDriveRepository.save(testDrive);
    }

    public TestDrive updateStatus(Long id, TestDrive.TestDriveStatus status) {
        TestDrive td = testDriveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test Drive not found"));
        td.setStatus(status);
        return testDriveRepository.save(td);
    }

    public List<TestDrive> getCustomerTestDrives(Long customerId) {
        return testDriveRepository.findByCustomerId(customerId);
    }

    public List<TestDrive> getAllTestDrives() {
        return testDriveRepository.findAll();
    }
}
