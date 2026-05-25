package com.cognizant.sales_service.service;

import com.cognizant.sales_service.client.NotificationFeignClient;
import com.cognizant.sales_service.dto.NotificationRequestDTO;
import com.cognizant.sales_service.entity.Commission;
import com.cognizant.sales_service.entity.Deal;
import com.cognizant.sales_service.entity.Quote;
import com.cognizant.sales_service.repository.CommissionRepository;
import com.cognizant.sales_service.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommissionService {

    private final CommissionRepository commissionRepository;
    private final DealService dealService;
    private final SalesService salesService;
    private final NotificationFeignClient notificationClient;

    public Commission calculateCommission(Long dealId) {
        Deal deal = dealService.getDeal(dealId);
        Quote quote = salesService.getQuote(deal.getQuoteId());

        // Flat 5% commission logic for simplicity
        BigDecimal commissionAmt = quote.getTotalPrice().multiply(new BigDecimal("0.05"));

        Commission commission = new Commission();
        commission.setDealId(dealId);
        commission.setSalesPersonId(deal.getSalesPersonId());
        commission.setCommissionAmount(commissionAmt);
        commission.setCalculatedAt(LocalDateTime.now());
        commission.setStatus("CALCULATED");

        Commission saved = commissionRepository.save(commission);

        // Notify the sales person their commission has been calculated
        try {
            String token = SecurityUtils.getCurrentToken();
            notificationClient.sendNotification(token, NotificationRequestDTO.builder()
                    .userId(deal.getSalesPersonId())
                    .channel("IN_APP")
                    .notificationType("COMMISSION_READY")
                    .subject("Commission Calculated for Deal #" + dealId)
                    .message("Your commission of $" + commissionAmt.setScale(2, java.math.RoundingMode.HALF_UP)
                            + " for Deal #" + dealId + " has been calculated and is pending approval.")
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send COMMISSION_READY notification for deal {}: {}", dealId, e.getMessage());
        }

        return saved;
    }

    public List<Commission> getAllCommissions() {
        return commissionRepository.findAll();
    }

    public List<Commission> getCommissionsBySalesPerson(Long salesPersonId) {
        return commissionRepository.findBySalesPersonId(salesPersonId);
    }

    public Commission markPaid(Long commissionId) {
        Commission commission = commissionRepository.findById(commissionId)
                .orElseThrow(() -> new RuntimeException("Commission not found: " + commissionId));
        commission.setStatus("PAID");
        commission.setPaidAt(java.time.LocalDateTime.now());
        Commission saved = commissionRepository.save(commission);

        // Notify the salesperson their commission has been paid
        try {
            String token = SecurityUtils.getCurrentToken();
            notificationClient.sendNotification(token, NotificationRequestDTO.builder()
                    .userId(commission.getSalesPersonId())
                    .channel("IN_APP")
                    .notificationType("COMMISSION_PAID")
                    .subject("Commission Paid for Deal #" + commission.getDealId())
                    .message("Your commission of $" + commission.getCommissionAmount().setScale(2, java.math.RoundingMode.HALF_UP)
                            + " for Deal #" + commission.getDealId() + " has been paid.")
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send COMMISSION_PAID notification for commission {}: {}", commissionId, e.getMessage());
        }

        return saved;
    }
}
