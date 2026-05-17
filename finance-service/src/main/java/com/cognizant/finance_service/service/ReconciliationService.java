package com.cognizant.finance_service.service;

import com.cognizant.finance_service.dto.AuditPackageRequestDTO;
import com.cognizant.finance_service.dto.ReconciliationRequestDTO;
import com.cognizant.finance_service.dto.ReconciliationResponseDTO;
import com.cognizant.finance_service.exception.BadRequestException;
import com.cognizant.finance_service.repository.InvoiceRepository;
import com.cognizant.finance_service.repository.PaymentRepository;
import com.cognizant.finance_service.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReconciliationService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final AuditPackageService auditPackageService;

    @Transactional
    public ReconciliationResponseDTO reconcile(ReconciliationRequestDTO request) {
        LocalDateTime start = request.getPeriodStart();
        LocalDateTime end   = request.getPeriodEnd();

        if (!end.isAfter(start)) {
            throw new BadRequestException("Period end must be after period start");
        }

        // Gather metrics
        long totalInvoices          = invoiceRepository.countByIssuedAtBetween(start, end);
        BigDecimal totalPayments    = paymentRepository.sumAmountByPaidAtBetween(start, end);
        long unpaidCount            = invoiceRepository.findByStatus("ISSUED").stream()
                .filter(i -> i.getIssuedAt() != null
                        && !i.getIssuedAt().isBefore(start)
                        && !i.getIssuedAt().isAfter(end))
                .count();

        // Require at least one invoice in the period before allowing reconciliation
        if (totalInvoices == 0) {
            throw new BadRequestException(
                    "No invoices found in the period " + start + " to " + end
                    + ". Cannot reconcile an empty period.");
        }

        String reconciledBy = SecurityUtils.getCurrentUserEmail();

        // Seal the period by generating an audit package
        Map<String, Object> contents = new HashMap<>();
        contents.put("totalInvoices",          totalInvoices);
        contents.put("totalPaymentsCollected", totalPayments);
        contents.put("unpaidInvoiceCount",     unpaidCount);
        contents.put("reconciledBy",           reconciledBy);
        contents.put("notes",                  request.getNotes());

        AuditPackageRequestDTO pkgRequest = new AuditPackageRequestDTO();
        pkgRequest.setPeriodStart(start);
        pkgRequest.setPeriodEnd(end);
        pkgRequest.setContentsJson(contents);

        var auditPackage = auditPackageService.generatePackage(pkgRequest);

        log.info("Reconciliation completed by {} for period {} to {}. Invoices: {}, Payments: {}",
                reconciledBy, start, end, totalInvoices, totalPayments);

        return ReconciliationResponseDTO.builder()
                .auditPackageId(auditPackage.getPackageId())
                .periodStart(start)
                .periodEnd(end)
                .totalInvoices(totalInvoices)
                .totalPaymentsCollected(totalPayments != null ? totalPayments : BigDecimal.ZERO)
                .unpaidInvoiceCount(unpaidCount)
                .reconciledBy(reconciledBy)
                .reconciledAt(LocalDateTime.now())
                .status("RECONCILED")
                .notes(request.getNotes())
                .build();
    }
}
