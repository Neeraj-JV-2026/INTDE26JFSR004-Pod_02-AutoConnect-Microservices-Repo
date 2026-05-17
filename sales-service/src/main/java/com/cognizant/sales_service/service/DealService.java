package com.cognizant.sales_service.service;

import com.cognizant.sales_service.client.FinanceFeignClient;
import com.cognizant.sales_service.client.InventoryFeignClient;
import com.cognizant.sales_service.dto.SaleInvoiceRequestDTO;
import com.cognizant.sales_service.entity.Deal;
import com.cognizant.sales_service.entity.Quote;
import com.cognizant.sales_service.exception.ResourceNotFoundException;
import com.cognizant.sales_service.repository.DealRepository;
import com.cognizant.sales_service.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DealService {

    private final DealRepository dealRepository;
    private final SalesService salesService;
    private final InventoryFeignClient inventoryClient;
    private final FinanceFeignClient financeClient;

    public Deal createDeal(Deal deal) {
        Quote quote = salesService.getQuote(deal.getQuoteId());
        if (!"GENERATED".equals(quote.getStatus()) && !"ACCEPTED".equals(quote.getStatus())) {
            throw new RuntimeException("Quote must be GENERATED or ACCEPTED to create a deal.");
        }
        deal.setStatus("PENDING");
        return dealRepository.save(deal);
    }

    public Deal getDeal(Long id) {
        return dealRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deal not found"));
    }

    public List<Deal> getAllDeals() {
        return dealRepository.findAll();
    }

    public Deal updateDeal(Long id, Deal updated) {
        Deal existing = getDeal(id);
        existing.setFinanceOffer(updated.getFinanceOffer());
        existing.setDealDocumentsUri(updated.getDealDocumentsUri());
        return dealRepository.save(existing);
    }

    public void deleteDeal(Long id) {
        dealRepository.deleteById(id);
    }

    public Deal approveDeal(Long id) {
        Deal deal = getDeal(id);
        deal.setStatus("APPROVED");
        deal.setApprovedAt(LocalDateTime.now());
        deal.setApprovedBy(SecurityUtils.getCurrentUserId());
        return dealRepository.save(deal);
    }

    public Deal rejectDeal(Long id) {
        Deal deal = getDeal(id);
        deal.setStatus("REJECTED");
        return dealRepository.save(deal);
    }

    @Transactional
    public Deal finalizeDeal(Long id) {
        Deal deal = getDeal(id);
        if (!"APPROVED".equals(deal.getStatus())) {
            throw new RuntimeException("Deal must be APPROVED before finalization.");
        }

        Quote quote = salesService.getQuote(deal.getQuoteId());
        String token = SecurityUtils.getCurrentToken();

        // Step 1: Mark vehicle sold in inventory — if this fails we never finalize
        inventoryClient.markSold(token, quote.getVehicleId());

        boolean invoiceTriggered = false;
        try {
            // Step 2: Trigger invoice creation in finance-service
            SaleInvoiceRequestDTO invoiceRequest = SaleInvoiceRequestDTO.builder()
                    .customerId(quote.getCustomerId())
                    .relatedEntityType("DEAL")
                    .relatedEntityId(deal.getDealId())
                    .subTotal(quote.getTotalPrice() != null ? quote.getTotalPrice() : BigDecimal.ZERO)
                    .taxAmount(BigDecimal.ZERO)
                    .dueAt(LocalDateTime.now().plusDays(30))
                    .build();

            financeClient.generateInvoice(token, invoiceRequest);
            invoiceTriggered = true;
        } catch (Exception e) {
            // Finance call failed after vehicle was already marked sold — compensate
            log.error("Finance invoice creation failed for deal {}; rolling back vehicle {} to AVAILABLE. Error: {}",
                    id, quote.getVehicleId(), e.getMessage());
            try {
                inventoryClient.markAvailable(token, quote.getVehicleId());
            } catch (Exception rollbackEx) {
                log.error("CRITICAL: Failed to roll back vehicle {} to AVAILABLE after finance failure: {}",
                        quote.getVehicleId(), rollbackEx.getMessage());
            }
            throw new RuntimeException("Deal finalization failed: could not create invoice. Vehicle status has been rolled back.", e);
        }

        deal.setStatus("FINALIZED");
        Deal saved = dealRepository.save(deal);
        log.info("Deal {} finalized. Vehicle {} marked SOLD. Invoice triggered: {}", id, quote.getVehicleId(), invoiceTriggered);
        return saved;
    }
}
