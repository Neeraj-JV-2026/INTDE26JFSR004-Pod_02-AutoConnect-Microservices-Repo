package com.cognizant.inventory_service.repository;

import com.cognizant.inventory_service.entity.PartInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PartInventoryRepository extends JpaRepository<PartInventory, Long> {

    Optional<PartInventory> findByPart_PartId(Long partId);

    List<PartInventory> findByLocationId(Long locationId);

    @Query("SELECT pi FROM PartInventory pi WHERE (pi.quantityOnHand - pi.quantityReserved) <= pi.reorderPoint")
    List<PartInventory> findLowStockItems();

    @Query("SELECT pi FROM PartInventory pi WHERE pi.part.partId = :partId AND pi.locationId = :locationId")
    Optional<PartInventory> findByPartIdAndLocationId(Long partId, Long locationId);
}
