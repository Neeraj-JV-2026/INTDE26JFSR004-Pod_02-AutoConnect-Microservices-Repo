package com.cognizant.customer_service.service;

import com.cognizant.customer_service.entity.Customer;
import com.cognizant.customer_service.exception.ResourceNotFoundException;
import com.cognizant.customer_service.repository.CustomerRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private CustomerService customerService;

    private Customer sample;

    @BeforeEach
    void setUp() {
        sample = new Customer();
        sample.setCustomerId(1L);
        sample.setName("John Doe");
        sample.setContactInfo("{\"email\":\"john@test.com\"}");
        sample.setLoyaltyTier("GOLD");
        sample.setStatus("ACTIVE");
        sample.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void createCustomer_savesAndReturns() {
        when(customerRepository.save(any(Customer.class))).thenReturn(sample);

        Customer result = customerService.createCustomer(sample);

        assertThat(result.getCustomerId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("John Doe");
        verify(auditService).logAction(eq("CREATE_CUSTOMER"), eq("CUSTOMER"), eq(1L), anyString());
    }

    @Test
    void getAllCustomers_returnsList() {
        when(customerRepository.findAll()).thenReturn(List.of(sample));

        List<Customer> result = customerService.getAllCustomers();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("John Doe");
    }

    @Test
    void getCustomerById_found_returnsCustomer() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(sample));

        Customer result = customerService.getCustomerById(1L);

        assertThat(result.getCustomerId()).isEqualTo(1L);
    }

    @Test
    void getCustomerById_notFound_throwsException() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.getCustomerById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void updateCustomer_updatesFields() {
        Customer updated = new Customer();
        updated.setName("Jane Doe");
        updated.setContactInfo("{\"email\":\"jane@test.com\"}");
        updated.setLoyaltyTier("SILVER");
        updated.setStatus("ACTIVE");

        when(customerRepository.findById(1L)).thenReturn(Optional.of(sample));
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));

        Customer result = customerService.updateCustomer(1L, updated);

        assertThat(result.getName()).isEqualTo("Jane Doe");
        assertThat(result.getLoyaltyTier()).isEqualTo("SILVER");
        verify(auditService).logAction(eq("UPDATE_CUSTOMER"), eq("CUSTOMER"), eq(1L), anyString());
    }

    @Test
    void deleteCustomer_deletesSuccessfully() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(sample));

        customerService.deleteCustomer(1L);

        verify(customerRepository).delete(sample);
        verify(auditService).logAction(eq("DELETE_CUSTOMER"), eq("CUSTOMER"), eq(1L), anyString());
    }

    @Test
    void deleteCustomer_notFound_throwsException() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.deleteCustomer(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
