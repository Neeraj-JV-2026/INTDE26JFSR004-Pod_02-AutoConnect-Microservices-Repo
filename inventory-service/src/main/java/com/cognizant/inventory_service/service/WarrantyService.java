package com.cognizant.inventory_service.service;

import com.cognizant.inventory_service.dto.WarrantyRequest;
import com.cognizant.inventory_service.entity.Warranty;
import com.cognizant.inventory_service.repository.WarrantyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WarrantyService {

    private final WarrantyRepository warrantyRepository;

    public Warranty createWarranty(WarrantyRequest request) {
        Warranty warranty = Warranty.builder()
                .vehicleId(request.getVehicleId())
                .customerId(request.getCustomerId())
                .warrantyType(request.getWarrantyType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .mileageLimit(request.getMileageLimit())
                .coverageDetails(request.getCoverageDetails())
                .status(Warranty.WarrantyStatus.ACTIVE)
                .build();

        return warrantyRepository.save(warranty);
    }

    @Transactional(readOnly = true)
    public List<Warranty> getAllWarranties() {
        return warrantyRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Warranty getWarrantyById(Long id) {
        return warrantyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warranty not found with id: " + id));
    }

    public Warranty updateWarranty(Long id, WarrantyRequest request) {
        Warranty warranty = getWarrantyById(id);
        warranty.setWarrantyType(request.getWarrantyType());
        warranty.setStartDate(request.getStartDate());
        warranty.setEndDate(request.getEndDate());
        warranty.setMileageLimit(request.getMileageLimit());
        warranty.setCoverageDetails(request.getCoverageDetails());
        return warrantyRepository.save(warranty);
    }

    @Transactional(readOnly = true)
    public List<Warranty> getWarrantiesByVehicle(Long vehicleId) {
        return warrantyRepository.findByVehicleId(vehicleId);
    }

    @Transactional(readOnly = true)
    public boolean isVehicleUnderWarranty(Long vehicleId) {
        return warrantyRepository.findByVehicleIdAndStatusAndEndDateAfter(
                vehicleId, Warranty.WarrantyStatus.ACTIVE, LocalDate.now()).isPresent();
    }
}
