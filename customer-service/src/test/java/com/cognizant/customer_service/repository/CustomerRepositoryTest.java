package com.cognizant.customer_service.repository;

import com.cognizant.customer_service.entity.Customer;
import com.cognizant.customer_service.entity.Interaction;
import com.cognizant.customer_service.entity.Lead;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Repository contract tests using Mockito stubs.
 * Verifies expected return types and method behaviours without a Spring context.
 */
@ExtendWith(MockitoExtension.class)
class CustomerRepositoryTest {

    @Mock private CustomerRepository    customerRepository;
    @Mock private LeadRepository        leadRepository;
    @Mock private InteractionRepository interactionRepository;

    // ── Customer ──────────────────────────────────────────────────────────────

    @Test
    void save_customer_returnsWithId() {
        Customer c = new Customer();
        c.setName("Alice Johnson");
        c.setStatus("ACTIVE");

        Customer saved = new Customer();
        saved.setCustomerId(1L);
        saved.setName("Alice Johnson");
        saved.setStatus("ACTIVE");
        saved.setCreatedAt(LocalDateTime.now());

        when(customerRepository.save(any(Customer.class))).thenReturn(saved);

        Customer result = customerRepository.save(c);

        assertThat(result.getCustomerId()).isNotNull();
        assertThat(result.getCreatedAt()).isNotNull();
        assertThat(result.getName()).isEqualTo("Alice Johnson");
    }

    @Test
    void findById_existingCustomer_returnsPresent() {
        Customer saved = new Customer();
        saved.setCustomerId(1L);
        saved.setName("Alice Johnson");

        when(customerRepository.findById(1L)).thenReturn(Optional.of(saved));

        Optional<Customer> result = customerRepository.findById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Alice Johnson");
    }

    @Test
    void findById_missingCustomer_returnsEmpty() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThat(customerRepository.findById(99L)).isEmpty();
    }

    @Test
    void findAll_returnsAllCustomers() {
        Customer c1 = new Customer(); c1.setCustomerId(1L); c1.setName("Alice");
        Customer c2 = new Customer(); c2.setCustomerId(2L); c2.setName("Bob");

        when(customerRepository.findAll()).thenReturn(List.of(c1, c2));

        List<Customer> all = customerRepository.findAll();

        assertThat(all).hasSize(2);
        assertThat(all).extracting(Customer::getName).containsExactly("Alice", "Bob");
    }

    @Test
    void delete_invokesDeleteOnRepository() {
        Customer c = new Customer();
        c.setCustomerId(1L);

        customerRepository.delete(c);

        verify(customerRepository).delete(c);
    }

    // ── Lead ──────────────────────────────────────────────────────────────────

    @Test
    void findByCustomerId_returnsLeadsForCustomer() {
        Lead l = new Lead();
        l.setLeadId(1L);
        l.setCustomerId(10L);
        l.setSource("WEBSITE");
        l.setStatus("NEW");

        when(leadRepository.findByCustomerId(10L)).thenReturn(List.of(l));

        List<Lead> results = leadRepository.findByCustomerId(10L);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getSource()).isEqualTo("WEBSITE");
    }

    @Test
    void findByAssignedTo_returnsMatchingLeads() {
        Lead l1 = new Lead(); l1.setLeadId(1L); l1.setAssignedTo(10L);
        Lead l2 = new Lead(); l2.setLeadId(2L); l2.setAssignedTo(10L);

        when(leadRepository.findByAssignedTo(10L)).thenReturn(List.of(l1, l2));

        List<Lead> results = leadRepository.findByAssignedTo(10L);

        assertThat(results).hasSize(2);
        assertThat(results).allMatch(l -> l.getAssignedTo().equals(10L));
    }

    @Test
    void save_lead_setsDefaultStatus() {
        Lead input = new Lead();
        input.setCustomerId(10L);
        input.setSource("REFERRAL");

        Lead persisted = new Lead();
        persisted.setLeadId(1L);
        persisted.setCustomerId(10L);
        persisted.setSource("REFERRAL");
        persisted.setStatus("NEW");
        persisted.setCreatedAt(LocalDateTime.now());

        when(leadRepository.save(any(Lead.class))).thenReturn(persisted);

        Lead result = leadRepository.save(input);

        assertThat(result.getStatus()).isEqualTo("NEW");
        assertThat(result.getCreatedAt()).isNotNull();
    }

    // ── Interaction ───────────────────────────────────────────────────────────

    @Test
    void findByCustomerId_returnsInteractions() {
        Interaction i = new Interaction();
        i.setInteractionId(1L);
        i.setCustomerId(10L);
        i.setChannel("CALL");
        i.setTimestamp(LocalDateTime.now());

        when(interactionRepository.findByCustomerId(10L)).thenReturn(List.of(i));

        List<Interaction> results = interactionRepository.findByCustomerId(10L);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getChannel()).isEqualTo("CALL");
    }

    @Test
    void save_interaction_returnsWithTimestamp() {
        Interaction input = new Interaction();
        input.setCustomerId(10L);
        input.setUserId(1L);
        input.setChannel("EMAIL");
        input.setMessage("Hello");

        Interaction persisted = new Interaction();
        persisted.setInteractionId(1L);
        persisted.setCustomerId(10L);
        persisted.setUserId(1L);
        persisted.setChannel("EMAIL");
        persisted.setTimestamp(LocalDateTime.now());

        when(interactionRepository.save(any(Interaction.class))).thenReturn(persisted);

        Interaction result = interactionRepository.save(input);

        assertThat(result.getTimestamp()).isNotNull();
        assertThat(result.getInteractionId()).isNotNull();
    }
}
