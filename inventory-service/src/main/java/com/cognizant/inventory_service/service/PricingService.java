package com.cognizant.inventory_service.service;

import com.cognizant.inventory_service.dto.PricingRequest;
import com.cognizant.inventory_service.dto.PricingResponse;
import com.cognizant.inventory_service.entity.PriceRule;
import com.cognizant.inventory_service.entity.Promotion;
import com.cognizant.inventory_service.entity.Vehicle;
import com.cognizant.inventory_service.exception.ResourceNotFoundException;
import com.cognizant.inventory_service.repository.PriceRuleRepository;
import com.cognizant.inventory_service.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PricingService {

    private final PriceRuleRepository priceRuleRepository;
    private final PromotionRepository promotionRepository;
    private final InventoryService inventoryService;

    // ─────────────────────────────────────────────
    // PRICING CALCULATION
    // Final Price = Base Price + Adjustments - Discounts
    // ─────────────────────────────────────────────
    public PricingResponse calculatePricing(PricingRequest request) {
        Vehicle vehicle = inventoryService.getVehicle(request.getVehicleId());
        BigDecimal basePrice = vehicle.getBasePrice() != null ? vehicle.getBasePrice() : BigDecimal.ZERO;

        BigDecimal totalAdjustments = BigDecimal.ZERO;
        BigDecimal totalDiscounts = BigDecimal.ZERO;

        // Step 1: Apply all active price rules that match this vehicle
        List<PriceRule> activeRules = priceRuleRepository
                .findByStatusAndEffectiveFromBeforeAndEffectiveToAfterOrderByPriorityDesc(
                        "ACTIVE", LocalDateTime.now(), LocalDateTime.now());

        for (PriceRule rule : activeRules) {
            if (vehicleMatchesConditions(vehicle, rule.getConditions())) {
                totalAdjustments = totalAdjustments.add(calculateAdjustment(rule, basePrice));
            }
        }

        // Step 2: Apply all valid active promotions
        List<Promotion> activePromotions = promotionRepository.findAllActivePromotions(LocalDateTime.now());

        for (Promotion promo : activePromotions) {
            totalDiscounts = totalDiscounts.add(calculateDiscount(promo, basePrice));
        }

        BigDecimal finalPrice = basePrice.add(totalAdjustments).subtract(totalDiscounts);

        return new PricingResponse(basePrice, totalAdjustments, totalDiscounts, finalPrice);
    }

    // ─────────────────────────────────────────────
    // PRICE RULE CRUD
    // ─────────────────────────────────────────────
    public PriceRule addPriceRule(PriceRule rule) {
        return priceRuleRepository.save(rule);
    }

    public List<PriceRule> getAllPriceRules() {
        return priceRuleRepository.findAll();
    }

    public PriceRule getPriceRule(Long id) {
        return priceRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PriceRule not found: " + id));
    }

    public PriceRule updatePriceRule(Long id, PriceRule updated) {
        PriceRule existing = getPriceRule(id);
        existing.setName(updated.getName());
        existing.setConditions(updated.getConditions());
        existing.setAdjustmentExpression(updated.getAdjustmentExpression());
        existing.setEffectiveFrom(updated.getEffectiveFrom());
        existing.setEffectiveTo(updated.getEffectiveTo());
        existing.setPriority(updated.getPriority());
        existing.setStatus(updated.getStatus());
        return priceRuleRepository.save(existing);
    }

    public void deletePriceRule(Long id) {
        priceRuleRepository.deleteById(id);
    }

    // ─────────────────────────────────────────────
    // PROMOTION CRUD
    // ─────────────────────────────────────────────
    public Promotion addPromotion(Promotion promo) {
        return promotionRepository.save(promo);
    }

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    public Promotion getPromotion(Long id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found: " + id));
    }

    public Promotion updatePromotion(Long id, Promotion updated) {
        Promotion existing = getPromotion(id);
        existing.setName(updated.getName());
        existing.setCode(updated.getCode());
        existing.setType(updated.getType());
        existing.setConditions(updated.getConditions());
        existing.setActions(updated.getActions());
        existing.setStartAt(updated.getStartAt());
        existing.setEndAt(updated.getEndAt());
        existing.setUsageLimit(updated.getUsageLimit());
        existing.setStatus(updated.getStatus());
        return promotionRepository.save(existing);
    }

    public void deletePromotion(Long id) {
        promotionRepository.deleteById(id);
    }

    // Apply a specific promotion (decrements its usageLimit)
    public Promotion applyPromotion(Long promoId) {
        Promotion promo = getPromotion(promoId);

        if (!"ACTIVE".equals(promo.getStatus())) {
            throw new IllegalStateException("Promotion is not active");
        }
        if (promo.getEndAt() != null && promo.getEndAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Promotion has expired");
        }
        if (promo.getUsageLimit() != null && promo.getUsageLimit() <= 0) {
            throw new IllegalStateException("Promotion usage limit exceeded");
        }

        // Decrement usage count
        if (promo.getUsageLimit() != null) {
            promo.setUsageLimit(promo.getUsageLimit() - 1);
        }

        return promotionRepository.save(promo);
    }

    // ─────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────

    // Check if a vehicle matches the rule's conditions JSON
    // Supported condition keys: "make", "model", "year", "conditionType"
    // If conditions map is empty/null → rule applies to ALL vehicles
    private boolean vehicleMatchesConditions(Vehicle vehicle, Map<String, Object> conditions) {
        if (conditions == null || conditions.isEmpty()) {
            return true;
        }
        if (conditions.containsKey("make")) {
            if (!conditions.get("make").toString().equalsIgnoreCase(vehicle.getMake())) return false;
        }
        if (conditions.containsKey("model")) {
            if (!conditions.get("model").toString().equalsIgnoreCase(vehicle.getModel())) return false;
        }
        if (conditions.containsKey("year")) {
            int ruleYear = Integer.parseInt(conditions.get("year").toString());
            if (vehicle.getYear() == null || vehicle.getYear() != ruleYear) return false;
        }
        if (conditions.containsKey("conditionType")) {
            if (!conditions.get("conditionType").toString().equalsIgnoreCase(
                    vehicle.getConditionType() != null ? vehicle.getConditionType().name() : "")) return false;
        }
        return true;
    }

    // Read adjustmentExpression JSON and compute the adjustment amount
    // Supports: {"type":"FIXED","amount":50000} or {"type":"PERCENTAGE","percentage":5}
    private BigDecimal calculateAdjustment(PriceRule rule, BigDecimal basePrice) {
        try {
            Map<String, Object> expr = rule.getAdjustmentExpression();
            if (expr == null || expr.isEmpty()) return BigDecimal.ZERO;

            String type = expr.getOrDefault("type", "FIXED").toString();
            if ("PERCENTAGE".equalsIgnoreCase(type)) {
                double pct = Double.parseDouble(expr.get("percentage").toString());
                return basePrice.multiply(BigDecimal.valueOf(pct / 100))
                        .setScale(2, RoundingMode.HALF_UP);
            } else {
                return new BigDecimal(expr.get("amount").toString());
            }
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    // Read promotion actions JSON and compute the discount amount
    // Supports: {"type":"PERCENTAGE","discount":2} or {"type":"FIXED","discount":20000}
    private BigDecimal calculateDiscount(Promotion promo, BigDecimal basePrice) {
        try {
            Map<String, Object> actions = promo.getActions();
            if (actions == null || actions.isEmpty()) return BigDecimal.ZERO;

            String type = actions.getOrDefault("type", "FIXED").toString();
            if ("PERCENTAGE".equalsIgnoreCase(type)) {
                double pct = Double.parseDouble(actions.get("discount").toString());
                return basePrice.multiply(BigDecimal.valueOf(pct / 100))
                        .setScale(2, RoundingMode.HALF_UP);
            } else {
                return new BigDecimal(actions.get("discount").toString());
            }
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
}
