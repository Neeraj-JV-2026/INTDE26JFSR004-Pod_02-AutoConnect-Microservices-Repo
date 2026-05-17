package com.cognizant.customer_service.service;

import com.cognizant.customer_service.entity.Customer;
import com.cognizant.customer_service.exception.ResourceNotFoundException;
import com.cognizant.customer_service.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final AuditService auditService;

    public Customer createCustomer(Customer customer) {
        Customer saved = customerRepository.save(customer);
        auditService.logAction("CREATE_CUSTOMER", "CUSTOMER", saved.getCustomerId(), "{}");
        return saved;
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
    }

    public Customer updateCustomer(Long id, Customer details) {
        Customer customer = getCustomerById(id);
        customer.setName(details.getName());
        customer.setContactInfo(details.getContactInfo());
        customer.setPreferredDealerId(details.getPreferredDealerId());
        customer.setVehicleOwnershipDetails(details.getVehicleOwnershipDetails());
        customer.setLoyaltyTier(details.getLoyaltyTier());
        customer.setStatus(details.getStatus());
        
        Customer updated = customerRepository.save(customer);
        auditService.logAction("UPDATE_CUSTOMER", "CUSTOMER", updated.getCustomerId(), "{}");
        return updated;
    }

    public void deleteCustomer(Long id) {
        Customer customer = getCustomerById(id);
        customerRepository.delete(customer);
        auditService.logAction("DELETE_CUSTOMER", "CUSTOMER", id, "{}");
    }
}
