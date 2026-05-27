package com.cognizant.finance_service.client;

import com.cognizant.finance_service.dto.CustomerLookupDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

/**
 * Feign client to resolve a CRM customer record and obtain the IAM userId.
 * Used by FinanceService to stamp the correct IAM userId on outbound
 * notifications so they appear in the customer's notification feed.
 */
@FeignClient(name = "customer-service", contextId = "financeCustomerFeignClient")
public interface CustomerFeignClient {

    @GetMapping("/api/customers/{id}")
    CustomerLookupDTO getCustomer(@RequestHeader("Authorization") String token,
                                  @PathVariable("id") Long id);
}
