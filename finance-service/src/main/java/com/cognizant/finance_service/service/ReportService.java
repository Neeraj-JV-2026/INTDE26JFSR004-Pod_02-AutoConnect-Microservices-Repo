package com.cognizant.finance_service.service;

import com.cognizant.finance_service.entity.Report;
import com.cognizant.finance_service.exception.ResourceNotFoundException;
import com.cognizant.finance_service.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;

    @Transactional
    public Report generateReport(Report report) {
        if (report.getReportUri() == null) {
            report.setReportUri("/reports/download/" + report.getScope().name().toLowerCase() + "-" + System.currentTimeMillis());
        }
        return reportRepository.save(report);
    }

    public Report getReport(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public List<Report> getReportsByScope(Report.ReportScope scope) {
        return reportRepository.findByScopeOrderByGeneratedAtDesc(scope);
    }

    @Transactional
    public void deleteReport(Long id) {
        if (!reportRepository.existsById(id)) {
            throw new ResourceNotFoundException("Report not found with id: " + id);
        }
        reportRepository.deleteById(id);
    }
}
