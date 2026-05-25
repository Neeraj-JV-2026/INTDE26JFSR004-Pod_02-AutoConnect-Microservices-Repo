package com.cognizant.customer_service.service;

import com.cognizant.customer_service.entity.Lead;
import com.cognizant.customer_service.exception.InvalidLeadStateException;
import com.cognizant.customer_service.exception.ResourceNotFoundException;
import com.cognizant.customer_service.repository.LeadRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeadServiceTest {

    @Mock
    private LeadRepository leadRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private LeadService leadService;

    private Lead sample;

    @BeforeEach
    void setUp() {
        sample = new Lead();
        sample.setLeadId(1L);
        sample.setCustomerId(10L);
        sample.setSource("WEBSITE");
        sample.setInterestedModel("Honda CR-V");
        sample.setStatus("NEW");
        sample.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void createLead_savesAndAudits() {
        when(leadRepository.save(any(Lead.class))).thenReturn(sample);

        Lead result = leadService.createLead(sample);

        assertThat(result.getLeadId()).isEqualTo(1L);
        assertThat(result.getStatus()).isEqualTo("NEW");
        verify(auditService).logAction(eq("CREATE_LEAD"), eq("LEAD"), eq(1L), anyString());
    }

    @Test
    void getLeadById_found_returnsLead() {
        when(leadRepository.findById(1L)).thenReturn(Optional.of(sample));

        Lead result = leadService.getLeadById(1L);

        assertThat(result.getSource()).isEqualTo("WEBSITE");
    }

    @Test
    void getLeadById_notFound_throwsException() {
        when(leadRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> leadService.getLeadById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getLeadsByCustomer_returnsList() {
        when(leadRepository.findByCustomerId(10L)).thenReturn(List.of(sample));

        List<Lead> result = leadService.getLeadsByCustomer(10L);

        assertThat(result).hasSize(1);
    }

    @Test
    void assignLead_setsAssignedTo() {
        when(leadRepository.findById(1L)).thenReturn(Optional.of(sample));
        when(leadRepository.save(any(Lead.class))).thenAnswer(inv -> inv.getArgument(0));

        Lead result = leadService.assignLead(1L, 5L);

        assertThat(result.getAssignedTo()).isEqualTo(5L);
        verify(auditService).logAction(eq("ASSIGN_LEAD"), eq("LEAD"), eq(1L), anyString());
    }

    @Test
    void updateStatus_unassignedLead_throwsInvalidLeadStateException() {
        sample.setAssignedTo(null);
        when(leadRepository.findById(1L)).thenReturn(Optional.of(sample));

        assertThatThrownBy(() -> leadService.updateStatus(1L, "CONTACTED"))
                .isInstanceOf(InvalidLeadStateException.class)
                .hasMessageContaining("assigned");
    }

    @Test
    void updateStatus_assignedLead_updatesStatus() {
        sample.setAssignedTo(5L);
        when(leadRepository.findById(1L)).thenReturn(Optional.of(sample));
        when(leadRepository.save(any(Lead.class))).thenAnswer(inv -> inv.getArgument(0));

        Lead result = leadService.updateStatus(1L, "contacted");

        assertThat(result.getStatus()).isEqualTo("CONTACTED");
        verify(auditService).logAction(eq("UPDATE_LEAD_STATUS"), eq("LEAD"), eq(1L), anyString());
    }

    @Test
    void convertLead_setsStatusConverted() {
        when(leadRepository.findById(1L)).thenReturn(Optional.of(sample));
        when(leadRepository.save(any(Lead.class))).thenAnswer(inv -> inv.getArgument(0));

        Lead result = leadService.convertLead(1L);

        assertThat(result.getStatus()).isEqualTo("CONVERTED");
        verify(auditService).logAction(eq("CONVERT_LEAD"), eq("LEAD"), eq(1L), anyString());
    }

    @Test
    void closeLead_setsStatusClosed() {
        when(leadRepository.findById(1L)).thenReturn(Optional.of(sample));
        when(leadRepository.save(any(Lead.class))).thenAnswer(inv -> inv.getArgument(0));

        Lead result = leadService.closeLead(1L);

        assertThat(result.getStatus()).isEqualTo("CLOSED");
    }

    @Test
    void deleteLead_deletesSuccessfully() {
        when(leadRepository.findById(1L)).thenReturn(Optional.of(sample));

        leadService.deleteLead(1L);

        verify(leadRepository).delete(sample);
        verify(auditService).logAction(eq("DELETE_LEAD"), eq("LEAD"), eq(1L), anyString());
    }
}
