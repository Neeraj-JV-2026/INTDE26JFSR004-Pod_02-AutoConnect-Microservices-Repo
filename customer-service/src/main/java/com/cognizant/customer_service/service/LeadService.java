package com.cognizant.customer_service.service;

import com.cognizant.customer_service.entity.Lead;
import com.cognizant.customer_service.exception.InvalidLeadStateException;
import com.cognizant.customer_service.exception.ResourceNotFoundException;
import com.cognizant.customer_service.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeadService {
    private final LeadRepository leadRepository;
    private final AuditService auditService;

    public Lead createLead(Lead lead) {
        Lead saved = leadRepository.save(lead);
        auditService.logAction("CREATE_LEAD", "LEAD", saved.getLeadId(), "{\"customerId\":"+lead.getCustomerId()+"}");
        return saved;
    }

    public Lead getLeadById(Long id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + id));
    }

    public List<Lead> getLeadsByCustomer(Long customerId) {
        return leadRepository.findByCustomerId(customerId);
    }

    public Lead assignLead(Long leadId, Long userId) {
        Lead lead = getLeadById(leadId);
        lead.setAssignedTo(userId);
        Lead saved = leadRepository.save(lead);
        auditService.logAction("ASSIGN_LEAD", "LEAD", leadId, "{\"assignedTo\":"+userId+"}");
        
        // 5.2 TODO: Trigger Notification Service (Module 6) 
        // [POST /notifications] lead assignment alert for user: userId
        
        return saved;
    }

    public Lead updateStatus(Long leadId, String status) {
        Lead lead = getLeadById(leadId);
        
        // Rules: Must be assigned before progressing
        if (lead.getAssignedTo() == null) {
            throw new InvalidLeadStateException("Lead must be assigned before updating status");
        }
        
        String oldStatus = lead.getStatus();
        lead.setStatus(status.toUpperCase());
        Lead saved = leadRepository.save(lead);
        
        auditService.logAction("UPDATE_LEAD_STATUS", "LEAD", leadId, 
            String.format("{\"old\":\"%s\", \"new\":\"%s\"}", oldStatus, saved.getStatus()));
            
        // 5.2 TODO: Trigger Notification Service (Module 6)
        // Send status update alert to customer and assigned representative
            
        return saved;
    }

    public Lead convertLead(Long leadId) {
        Lead lead = getLeadById(leadId);
        lead.setStatus("CONVERTED");
        Lead saved = leadRepository.save(lead);
        
        // 5.1 TODO: Trigger Sales Service (Module 4) - Quote Initiation Request
        // POST /quotes | Payload: { customerId: lead.customerId, leadId: lead.leadId }
        System.out.println("Triggering Sales Service for Lead: " + leadId);
        
        auditService.logAction("CONVERT_LEAD", "LEAD", leadId, "{}");
        
        return saved;
    }

    public Lead closeLead(Long leadId) {
        Lead lead = getLeadById(leadId);
        lead.setStatus("CLOSED");
        Lead saved = leadRepository.save(lead);
        auditService.logAction("CLOSE_LEAD", "LEAD", leadId, "{}");
        return saved;
    }

    public void deleteLead(Long id) {
        leadRepository.delete(getLeadById(id));
        auditService.logAction("DELETE_LEAD", "LEAD", id, "{}");
    }
}
