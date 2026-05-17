package com.cognizant.inventory_service.repository;

import com.cognizant.inventory_service.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Optional<Vehicle> findByVin(String vin);

    Optional<Vehicle> findByStockNumber(String stockNumber);

    List<Vehicle> findByStatus(Vehicle.VehicleStatus status);
}
