package com.cognizant.sales_service.service;

import com.cognizant.sales_service.entity.Commission;
import com.cognizant.sales_service.entity.Deal;
import com.cognizant.sales_service.entity.Quote;
import com.cognizant.sales_service.repository.CommissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommissionService {

    private final CommissionRepository commissionRepository;
    private final DealService dealService;
    private final SalesService salesService;

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

        return commissionRepository.save(commission);
    }

    public List<Commission> getAllCommissions() {
        return commissionRepository.findAll();
    }
}
