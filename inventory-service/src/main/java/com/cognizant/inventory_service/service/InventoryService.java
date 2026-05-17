package com.cognizant.inventory_service.service;

import com.cognizant.inventory_service.entity.Vehicle;
import com.cognizant.inventory_service.exception.ResourceNotFoundException;
import com.cognizant.inventory_service.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final VehicleRepository vehicleRepository;

    // Add a new vehicle — always starts as AVAILABLE
    public Vehicle addVehicle(Vehicle vehicle) {
        vehicle.setStatus(Vehicle.VehicleStatus.AVAILABLE);
        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle getVehicle(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));
    }

    public Vehicle updateVehicle(Long id, Vehicle updatedVehicle) {
        Vehicle vehicle = getVehicle(id);
        vehicle.setMake(updatedVehicle.getMake());
        vehicle.setModel(updatedVehicle.getModel());
        vehicle.setYear(updatedVehicle.getYear());
        vehicle.setTrim(updatedVehicle.getTrim());
        vehicle.setColor(updatedVehicle.getColor());
        vehicle.setMileage(updatedVehicle.getMileage());
        vehicle.setConditionType(updatedVehicle.getConditionType());
        vehicle.setLocationId(updatedVehicle.getLocationId());
        vehicle.setBasePrice(updatedVehicle.getBasePrice());
        vehicle.setMsrp(updatedVehicle.getMsrp());
        return vehicleRepository.save(vehicle);
    }

    public void deleteVehicle(Long id) {
        Vehicle vehicle = getVehicle(id);
        vehicleRepository.delete(vehicle);
    }

    // Mark a vehicle back to AVAILABLE (e.g. reservation cancelled)
    public Vehicle markAvailable(Long id) {
        Vehicle vehicle = getVehicle(id);
        vehicle.setStatus(Vehicle.VehicleStatus.AVAILABLE);
        return vehicleRepository.save(vehicle);
    }

    // Mark a vehicle as SOLD — only allowed if currently AVAILABLE or RESERVED
    public Vehicle markSold(Long id) {
        Vehicle vehicle = getVehicle(id);
        if (vehicle.getStatus() == Vehicle.VehicleStatus.SOLD) {
            throw new IllegalStateException("Vehicle is already marked as SOLD");
        }
        vehicle.setStatus(Vehicle.VehicleStatus.SOLD);
        return vehicleRepository.save(vehicle);
    }

    // Used by Sales and Service modules to verify vehicle is free to use
    public boolean checkAvailability(Long vehicleId) {
        Vehicle vehicle = getVehicle(vehicleId);
        return vehicle.getStatus() == Vehicle.VehicleStatus.AVAILABLE;
    }
}
