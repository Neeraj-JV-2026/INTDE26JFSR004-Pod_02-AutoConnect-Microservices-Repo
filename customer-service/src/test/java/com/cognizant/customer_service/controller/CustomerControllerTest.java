package com.cognizant.customer_service.controller;

import com.cognizant.customer_service.dto.CustomerRequestDTO;
import com.cognizant.customer_service.entity.Customer;
import com.cognizant.customer_service.exception.GlobalExceptionHandler;
import com.cognizant.customer_service.exception.ResourceNotFoundException;
import com.cognizant.customer_service.service.CustomerService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CustomerControllerTest {

    @Mock
    private CustomerService customerService;

    @InjectMocks
    private CustomerController customerController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .findAndRegisterModules();

    private Customer sampleCustomer;
    private CustomerRequestDTO validRequest;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(customerController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        sampleCustomer = new Customer();
        sampleCustomer.setCustomerId(1L);
        sampleCustomer.setName("John Doe");
        sampleCustomer.setContactInfo("{\"email\":\"john@test.com\"}");
        sampleCustomer.setLoyaltyTier("GOLD");
        sampleCustomer.setStatus("ACTIVE");
        sampleCustomer.setCreatedAt(LocalDateTime.now());

        validRequest = new CustomerRequestDTO();
        validRequest.setName("John Doe");
        validRequest.setContactInfo("{\"email\":\"john@test.com\"}");
        validRequest.setLoyaltyTier("GOLD");
        validRequest.setStatus("ACTIVE");
    }

    @Test
    void getAllCustomers_returns200WithList() throws Exception {
        when(customerService.getAllCustomers()).thenReturn(List.of(sampleCustomer));

        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].customerId").value(1))
                .andExpect(jsonPath("$[0].name").value("John Doe"));
    }

    @Test
    void getCustomerById_found_returns200() throws Exception {
        when(customerService.getCustomerById(1L)).thenReturn(sampleCustomer);

        mockMvc.perform(get("/api/customers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerId").value(1))
                .andExpect(jsonPath("$.loyaltyTier").value("GOLD"));
    }

    @Test
    void getCustomerById_notFound_returns404() throws Exception {
        when(customerService.getCustomerById(99L))
                .thenThrow(new ResourceNotFoundException("Customer not found: 99"));

        mockMvc.perform(get("/api/customers/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void createCustomer_validRequest_returns201() throws Exception {
        when(customerService.createCustomer(any(Customer.class))).thenReturn(sampleCustomer);

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("John Doe"));
    }

    @Test
    void createCustomer_missingName_returns400() throws Exception {
        validRequest.setName("");

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    void createCustomer_invalidLoyaltyTier_returns400() throws Exception {
        validRequest.setLoyaltyTier("DIAMOND");

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateCustomer_validRequest_returns200() throws Exception {
        when(customerService.updateCustomer(eq(1L), any(Customer.class))).thenReturn(sampleCustomer);

        mockMvc.perform(put("/api/customers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerId").value(1));
    }

    @Test
    void deleteCustomer_returns204() throws Exception {
        doNothing().when(customerService).deleteCustomer(1L);

        mockMvc.perform(delete("/api/customers/1"))
                .andExpect(status().isNoContent());
    }
}
