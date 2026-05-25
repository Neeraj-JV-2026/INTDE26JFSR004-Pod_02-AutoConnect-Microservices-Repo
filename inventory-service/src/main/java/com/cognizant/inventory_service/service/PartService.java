package com.cognizant.inventory_service.service;

import com.cognizant.inventory_service.client.NotificationFeignClient;
import com.cognizant.inventory_service.dto.NotificationRequestDTO;
import com.cognizant.inventory_service.dto.PartInventoryRequest;
import com.cognizant.inventory_service.dto.PartRequest;
import com.cognizant.inventory_service.dto.PartReserveRequest;
import com.cognizant.inventory_service.entity.Part;
import com.cognizant.inventory_service.entity.PartInventory;
import com.cognizant.inventory_service.repository.PartInventoryRepository;
import com.cognizant.inventory_service.repository.PartRepository;
import com.cognizant.inventory_service.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PartService {

    private final PartRepository partRepository;
    private final PartInventoryRepository partInventoryRepository;
    private final com.cognizant.inventory_service.repository.PartOrderRepository partOrderRepository;
    private final NotificationFeignClient notificationClient;
    private final SecurityUtils securityUtils;

    // ════════════════════════════════════════════════════════
    //  PART CRUD
    // ════════════════════════════════════════════════════════

    public Part createPart(PartRequest request) {
        if (partRepository.findByPartNumber(request.getPartNumber()).isPresent()) {
            throw new RuntimeException(
                    "A Part with part number '" + request.getPartNumber() + "' already exists");
        }

        Part part = Part.builder()
                .partNumber(request.getPartNumber())
                .description(request.getDescription())
                .manufacturer(request.getManufacturer())
                .unitOfMeasure(request.getUnitOfMeasure())
                .cost(request.getCost())
                .retailPrice(request.getRetailPrice())
                .status(Part.PartStatus.ACTIVE)
                .build();

        return partRepository.save(part);
    }

    @Transactional(readOnly = true)
    public List<Part> getAllParts() {
        return partRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Part getPartById(Long id) {
        return partRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Part not found with id: " + id));
    }

    public Part updatePart(Long id, PartRequest request) {
        Part part = getPartById(id);

        if (!part.getPartNumber().equals(request.getPartNumber())
                && partRepository.findByPartNumber(request.getPartNumber()).isPresent()) {
            throw new RuntimeException(
                    "Another Part already uses part number '" + request.getPartNumber() + "'");
        }

        part.setPartNumber(request.getPartNumber());
        part.setDescription(request.getDescription());
        part.setManufacturer(request.getManufacturer());
        part.setUnitOfMeasure(request.getUnitOfMeasure());
        part.setCost(request.getCost());
        part.setRetailPrice(request.getRetailPrice());

        return partRepository.save(part);
    }

    // ════════════════════════════════════════════════════════
    //  INVENTORY
    // ════════════════════════════════════════════════════════

    public PartInventory createInventory(PartInventoryRequest request) {
        Part part = getPartById(request.getPartId());

        if (partInventoryRepository.findByPartIdAndLocationId(
                request.getPartId(), request.getLocationId()).isPresent()) {
            throw new RuntimeException(
                "Inventory already exists for Part ID " + request.getPartId() +
                " at Location ID " + request.getLocationId());
        }

        PartInventory inventory = PartInventory.builder()
                .part(part)
                .locationId(request.getLocationId())
                .quantityOnHand(request.getQuantityOnHand())
                .quantityReserved(request.getQuantityReserved())
                .reorderPoint(request.getReorderPoint())
                .build();

        return partInventoryRepository.save(inventory);
    }

    @Transactional(readOnly = true)
    public List<PartInventory> getAllInventory() {
        return partInventoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public PartInventory getInventoryByPartId(Long partId) {
        return partInventoryRepository.findByPart_PartId(partId)
                .orElseThrow(() -> new RuntimeException("PartInventory not found for partId: " + partId));
    }

    // ════════════════════════════════════════════════════════
    //  RESERVE / CONSUME LOGIC (Simplified for Inventory Service)
    // ════════════════════════════════════════════════════════

    public PartInventory reservePart(Long partId, PartReserveRequest request) {
        PartInventory inventory = partInventoryRepository
                .findByPartIdAndLocationId(partId, request.getLocationId())
                .orElseThrow(() -> new RuntimeException("Inventory not found"));

        int available = inventory.getQuantityOnHand() - inventory.getQuantityReserved();

        if (available < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock");
        }

        inventory.setQuantityReserved(inventory.getQuantityReserved() + request.getQuantity());
        return partInventoryRepository.save(inventory);
    }

    public PartInventory consumePart(Long partId, Long locationId, int quantity) {
        PartInventory inventory = partInventoryRepository
                .findByPartIdAndLocationId(partId, locationId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for part " + partId
                        + " at location " + locationId));

        if (inventory.getQuantityOnHand() < quantity) {
            throw new RuntimeException("Cannot consume " + quantity
                    + " units — only " + inventory.getQuantityOnHand() + " on hand");
        }

        inventory.setQuantityOnHand(inventory.getQuantityOnHand() - quantity);
        int newReserved = Math.max(0, inventory.getQuantityReserved() - quantity);
        inventory.setQuantityReserved(newReserved);

        PartInventory saved = partInventoryRepository.save(inventory);

        if (inventory.getReorderPoint() != null
                && saved.getQuantityOnHand() <= inventory.getReorderPoint()) {
            triggerLowStockNotification(saved);
        }

        return saved;
    }

    public void adjustStock(Long partId, Long locationId, Integer quantityChange) {
        PartInventory inventory = partInventoryRepository
                .findByPartIdAndLocationId(partId, locationId)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));

        inventory.setQuantityOnHand(inventory.getQuantityOnHand() + quantityChange);
        partInventoryRepository.save(inventory);

        // Check for Low Stock
        if (inventory.getReorderPoint() != null && inventory.getQuantityOnHand() <= inventory.getReorderPoint()) {
            triggerLowStockNotification(inventory);
        }
    }

    private void triggerLowStockNotification(PartInventory inventory) {
        try {
            String token = securityUtils.getCurrentJwtToken();
            notificationClient.sendNotification("Bearer " + token, NotificationRequestDTO.builder()
                    .userId(1L) // Notify inventory manager (admin)
                    .channel("IN_APP")
                    .notificationType("LOW_STOCK_ALERT")
                    .subject("Low Stock Alert — Part " + inventory.getPart().getPartNumber())
                    .message("CRITICAL: Low stock for part " + inventory.getPart().getPartNumber()
                            + " at location " + inventory.getLocationId()
                            + ". Current quantity: " + inventory.getQuantityOnHand()
                            + ". Reorder point: " + inventory.getReorderPoint() + ". Please reorder immediately.")
                    .build());
            log.info("Low stock notification triggered for part: {}", inventory.getPart().getPartId());
        } catch (Exception e) {
            log.error("Failed to send low stock notification", e);
        }
    }

    // ════════════════════════════════════════════════════════
    //  PART ORDERS (Procurement)
    // ════════════════════════════════════════════════════════

    public com.cognizant.inventory_service.entity.PartOrder createPartOrder(
            com.cognizant.inventory_service.entity.PartOrder order) {
        return partOrderRepository.save(order);
    }

    public com.cognizant.inventory_service.entity.PartOrder receivePartOrder(
            Long orderId, Integer quantityReceived, Long locationId) {
        
        com.cognizant.inventory_service.entity.PartOrder order = partOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setQuantityReceived(quantityReceived);
        order.setReceivedAt(java.time.LocalDateTime.now());
        order.setStatus(com.cognizant.inventory_service.entity.PartOrder.PartOrderStatus.RECEIVED);

        // Increase stock automatically
        adjustStock(order.getPart().getPartId(), locationId, quantityReceived);

        return partOrderRepository.save(order);
    }
}
