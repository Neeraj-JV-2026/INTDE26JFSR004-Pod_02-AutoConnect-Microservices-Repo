package com.cognizant.sales_service.service;

import com.cognizant.sales_service.client.FinanceFeignClient;
import com.cognizant.sales_service.client.InventoryFeignClient;
import com.cognizant.sales_service.client.NotificationFeignClient;
import com.cognizant.sales_service.dto.NotificationRequestDTO;
import com.cognizant.sales_service.dto.SaleInvoiceRequestDTO;
import com.cognizant.sales_service.entity.Commission;
import com.cognizant.sales_service.entity.Deal;
import com.cognizant.sales_service.entity.Quote;
import com.cognizant.sales_service.exception.ResourceNotFoundException;
import com.cognizant.sales_service.repository.CommissionRepository;
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
    private final CommissionRepository commissionRepository;
    private final SalesService salesService;
    private final InventoryFeignClient inventoryClient;
    private final FinanceFeignClient financeClient;
    private final NotificationFeignClient notificationClient;

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
        Deal saved = dealRepository.save(deal);

        // Notify the sales person that their deal has been approved
        try {
            String token = SecurityUtils.getCurrentToken();
            Quote quote = salesService.getQuote(deal.getQuoteId());
            notificationClient.sendNotification(token, NotificationRequestDTO.builder()
                    .userId(deal.getSalesPersonId())
                    .customerId(quote.getCustomerId())
                    .channel("IN_APP")
                    .notificationType("DEAL_APPROVED")
                    .subject("Deal #" + id + " Approved")
                    .message("Deal #" + id + " has been approved and is ready for finalization.")
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send DEAL_APPROVED notification for deal {}: {}", id, e.getMessage());
        }

        return saved;
    }

    public Deal rejectDeal(Long id) {
        Deal deal = getDeal(id);
        deal.setStatus("REJECTED");
        Deal saved = dealRepository.save(deal);

        // Notify the sales person that their deal was rejected
        try {
            String token = SecurityUtils.getCurrentToken();
            notificationClient.sendNotification(token, NotificationRequestDTO.builder()
                    .userId(deal.getSalesPersonId())
                    .channel("IN_APP")
                    .notificationType("DEAL_REJECTED")
                    .subject("Deal #" + id + " Rejected")
                    .message("Deal #" + id + " has been rejected. Please review and resubmit.")
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send DEAL_REJECTED notification for deal {}: {}", id, e.getMessage());
        }

        return saved;
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
        try {
            inventoryClient.markSold(token, quote.getVehicleId());
        } catch (Exception e) {
            log.error("Failed to mark vehicle {} as sold for deal {}: {}", quote.getVehicleId(), id, e.getMessage());
            throw new RuntimeException("Deal finalization failed: could not update vehicle status in inventory. " + e.getMessage(), e);
        }

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

        // Step 3: Auto-calculate and record commission (5% of deal value)
        try {
            BigDecimal commissionAmt = quote.getTotalPrice() != null
                    ? quote.getTotalPrice().multiply(new BigDecimal("0.05"))
                    : BigDecimal.ZERO;
            Commission commission = new Commission();
            commission.setDealId(id);
            commission.setSalesPersonId(deal.getSalesPersonId());
            commission.setCommissionAmount(commissionAmt);
            commission.setCalculatedAt(LocalDateTime.now());
            commission.setStatus("CALCULATED");
            commissionRepository.save(commission);
            log.info("Commission of ${} calculated for salesperson {} on deal {}", commissionAmt, deal.getSalesPersonId(), id);
        } catch (Exception e) {
            log.warn("Failed to record commission for deal {}: {}", id, e.getMessage());
        }

        // Notify customer that their deal is finalized
        try {
            notificationClient.sendNotification(token, NotificationRequestDTO.builder()
                    .userId(deal.getSalesPersonId())
                    .customerId(quote.getCustomerId())
                    .channel("EMAIL")
                    .notificationType("DEAL_FINALIZED")
                    .subject("Congratulations — Your Deal is Finalized!")
                    .message("Deal #" + id + " has been finalized. Vehicle ID " + quote.getVehicleId()
                            + " is now yours. An invoice has been generated for your records.")
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send DEAL_FINALIZED notification for deal {}: {}", id, e.getMessage());
        }

        return saved;
    }
}
