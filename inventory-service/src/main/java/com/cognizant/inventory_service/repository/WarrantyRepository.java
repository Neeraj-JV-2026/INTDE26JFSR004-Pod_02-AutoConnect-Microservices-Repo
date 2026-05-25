package com.cognizant.inventory_service.repository;

import com.cognizant.inventory_service.entity.Warranty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WarrantyRepository extends JpaRepository<Warranty, Long> {

    List<Warranty> findByVehicleId(Long vehicleId);

    List<Warranty> findByCustomerId(Long customerId);

    List<Warranty> findByStatus(Warranty.WarrantyStatus status);

    Optional<Warranty> findByVehicleIdAndStatusAndEndDateAfter(
            Long vehicleId, Warranty.WarrantyStatus status, LocalDate date);
}
