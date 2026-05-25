package com.cognizant.finance_service.service;

import com.cognizant.finance_service.dto.AuditPackageRequestDTO;
import com.cognizant.finance_service.dto.AuditPackageResponseDTO;
import com.cognizant.finance_service.entity.AuditPackage;
import com.cognizant.finance_service.exception.ResourceNotFoundException;
import com.cognizant.finance_service.repository.AuditPackageRepository;
import com.cognizant.finance_service.repository.InvoiceRepository;
import com.cognizant.finance_service.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditPackageService {

    private final AuditPackageRepository auditPackageRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public AuditPackageResponseDTO generatePackage(AuditPackageRequestDTO dto) {
        Map<String, Object> contents = buildContents(dto.getPeriodStart(), dto.getPeriodEnd(),
                dto.getContentsJson());

        AuditPackage pkg = AuditPackage.builder()
                .periodStart(dto.getPeriodStart())
                .periodEnd(dto.getPeriodEnd())
                .contentsJson(contents)
                .packageUri(dto.getPackageUri())
                .build();

        return mapToResponse(auditPackageRepository.save(pkg));
    }

    public AuditPackageResponseDTO getPackage(Long id) {
        return mapToResponse(auditPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AuditPackage not found with id: " + id)));
    }

    public List<AuditPackageResponseDTO> getAllPackages() {
        return auditPackageRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deletePackage(Long id) {
        if (!auditPackageRepository.existsById(id)) {
            throw new ResourceNotFoundException("AuditPackage not found with id: " + id);
        }
        auditPackageRepository.deleteById(id);
    }

    private Map<String, Object> buildContents(LocalDateTime start, LocalDateTime end,
                                               Map<String, Object> extra) {
        Map<String, Object> contents = new HashMap<>();
        contents.put("invoiceCount", invoiceRepository.countByIssuedAtBetween(start, end));
        contents.put("totalPayments", paymentRepository.sumAmountByPaidAtBetween(start, end));
        contents.put("generatedAt", LocalDateTime.now().toString());
        if (extra != null) {
            contents.putAll(extra);
        }
        return contents;
    }

    private AuditPackageResponseDTO mapToResponse(AuditPackage pkg) {
        return AuditPackageResponseDTO.builder()
                .packageId(pkg.getPackageId())
                .periodStart(pkg.getPeriodStart())
                .periodEnd(pkg.getPeriodEnd())
                .contentsJson(pkg.getContentsJson())
                .generatedAt(pkg.getGeneratedAt())
                .packageUri(pkg.getPackageUri())
                .build();
    }
}
