package com.cognizant.sales_service.service;

import com.cognizant.sales_service.client.CrmFeignClient;
import com.cognizant.sales_service.client.InventoryFeignClient;
import com.cognizant.sales_service.client.NotificationFeignClient;
import com.cognizant.sales_service.dto.AvailabilityRequest;
import com.cognizant.sales_service.dto.AvailabilityResponse;
import com.cognizant.sales_service.dto.NotificationRequestDTO;
import com.cognizant.sales_service.dto.PricingRequest;
import com.cognizant.sales_service.dto.PricingResponse;
import com.cognizant.sales_service.entity.Quote;
import com.cognizant.sales_service.exception.ResourceNotFoundException;
import com.cognizant.sales_service.repository.QuoteRepository;
import com.cognizant.sales_service.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SalesService {

    private final QuoteRepository quoteRepository;
    private final InventoryFeignClient inventoryClient;
    private final CrmFeignClient crmClient;
    private final NotificationFeignClient notificationClient;
    private final PromotionService promotionService;

    public Quote applyPromoCode(Long quoteId, String promoCode) {
        Quote quote = getQuote(quoteId);
        com.cognizant.sales_service.entity.Promotion promo = promotionService.validatePromoCode(promoCode)
                .orElseThrow(() -> new RuntimeException("Invalid or expired promo code"));

        if (quote.getTotalPrice() != null) {
            java.math.BigDecimal discount;
            if (promo.getDiscountType() == com.cognizant.sales_service.entity.Promotion.DiscountType.PERCENTAGE) {
                discount = quote.getTotalPrice().multiply(promo.getValue())
                        .divide(new java.math.BigDecimal("100"));
            } else {
                discount = promo.getValue();
            }
            quote.setTotalPrice(quote.getTotalPrice().subtract(discount));
        }
        return quoteRepository.save(quote);
    }

    public Quote createQuote(Quote quote) {
        Quote saved = quoteRepository.save(quote);
        triggerFinanceNotification(saved);
        return saved;
    }

    private void triggerFinanceNotification(Quote quote) {
        try {
            String token = SecurityUtils.getCurrentToken();
            if (token == null) return;

            notificationClient.sendNotification(token, NotificationRequestDTO.builder()
                    .customerId(quote.getCustomerId())
                    .userId(quote.getCustomerId())
                    .channel("IN_APP")
                    .notificationType("QUOTE_GENERATED")
                    .subject("New Quote Created — Quote #" + quote.getQuoteId())
                    .message("A new quote #" + quote.getQuoteId()
                            + " has been generated for your review.")
                    .build());
        } catch (Exception e) {
            log.warn("Could not send QUOTE_GENERATED notification for quote {}: {}", quote.getQuoteId(), e.getMessage());
        }
    }

    public Quote getQuote(Long id) {
        return quoteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quote not found"));
    }

    public List<Quote> getAllQuotes() {
        return quoteRepository.findAll();
    }

    public Quote updateQuote(Long id, Quote updated) {
        Quote existing = getQuote(id);
        existing.setOptions(updated.getOptions());
        existing.setTradeInDetails(updated.getTradeInDetails());
        existing.setStatus(updated.getStatus());
        return quoteRepository.save(existing);
    }

    public void deleteQuote(Long id) {
        quoteRepository.deleteById(id);
    }

    public Quote generateQuote(Long id) {
        Quote quote = getQuote(id);
        String token = SecurityUtils.getCurrentToken();

        AvailabilityRequest availabilityRequest = new AvailabilityRequest();
        availabilityRequest.setVehicleId(quote.getVehicleId());
        AvailabilityResponse avail = inventoryClient.checkAvailability(token, availabilityRequest);
        if (!avail.isAvailable()) {
            throw new RuntimeException("Vehicle is not available for quoting.");
        }

        PricingRequest pr = new PricingRequest();
        pr.setVehicleId(quote.getVehicleId());
        pr.setCustomerId(quote.getCustomerId());
        PricingResponse pricing = inventoryClient.calculatePricing(token, pr);

        quote.setTotalPrice(pricing.getFinalPrice());
        quote.setStatus("GENERATED");
        quote.setExpiresAt(LocalDateTime.now().plusDays(7));

        return quoteRepository.save(quote);
    }

    public Quote expireQuote(Long id) {
        Quote quote = getQuote(id);
        quote.setStatus("EXPIRED");
        return quoteRepository.save(quote);
    }
}
