package com.cognizant.customer_service.controller;

import com.cognizant.customer_service.dto.CustomerRequestDTO;
import com.cognizant.customer_service.dto.CustomerResponseDTO;
import com.cognizant.customer_service.entity.Customer;
import com.cognizant.customer_service.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Customer management APIs")
public class CustomerController {
    private final CustomerService customerService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_CONSULTANT')")
    @Operation(summary = "Create a new customer")
    public ResponseEntity<CustomerResponseDTO> createCustomer(@Valid @RequestBody CustomerRequestDTO dto) {
        Customer customer = mapToCustomerEntity(dto);
        return new ResponseEntity<>(mapToCustomerResponse(customerService.createCustomer(customer)), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_CONSULTANT', 'AUDITOR')")
    @Operation(summary = "Get all customers")
    public ResponseEntity<List<CustomerResponseDTO>> getAllCustomers() {
        List<CustomerResponseDTO> list = customerService.getAllCustomers().stream()
                .map(c -> mapToCustomerResponse(c)).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_CONSULTANT', 'AUDITOR')")
    @Operation(summary = "Get customer by ID")
    public ResponseEntity<CustomerResponseDTO> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(mapToCustomerResponse(customerService.getCustomerById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_CONSULTANT')")
    @Operation(summary = "Update an existing customer")
    public ResponseEntity<CustomerResponseDTO> updateCustomer(@PathVariable Long id, @Valid @RequestBody CustomerRequestDTO dto) {
        Customer customer = mapToCustomerEntity(dto);
        return ResponseEntity.ok(mapToCustomerResponse(customerService.updateCustomer(id, customer)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Delete a customer")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    private Customer mapToCustomerEntity(CustomerRequestDTO dto) {
        Customer c = new Customer();
        c.setName(dto.getName());
        c.setContactInfo(dto.getContactInfo());
        c.setPreferredDealerId(dto.getPreferredDealerId());
        c.setVehicleOwnershipDetails(dto.getVehicleOwnershipDetails());
        c.setLoyaltyTier(dto.getLoyaltyTier());
        c.setStatus(dto.getStatus());
        return c;
    }

    private CustomerResponseDTO mapToCustomerResponse(Customer c) {
        return CustomerResponseDTO.builder()
                .customerId(c.getCustomerId())
                .name(c.getName())
                .contactInfo(c.getContactInfo())
                .preferredDealerId(c.getPreferredDealerId())
                .vehicleOwnershipDetails(c.getVehicleOwnershipDetails())
                .loyaltyTier(c.getLoyaltyTier())
                .status(c.getStatus())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
