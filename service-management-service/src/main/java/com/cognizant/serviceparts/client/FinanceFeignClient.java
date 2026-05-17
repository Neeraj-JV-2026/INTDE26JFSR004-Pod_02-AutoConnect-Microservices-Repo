package com.cognizant.serviceparts.client;

import com.cognizant.serviceparts.dto.InvoiceRequest;
import com.cognizant.serviceparts.dto.TaskRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "finance-service")
public interface FinanceFeignClient {

    @PostMapping("/api/finance/tasks")
    void createTask(@RequestHeader("Authorization") String token,
                    @RequestBody TaskRequestDTO dto);

    @PostMapping("/api/finance/invoices")
    void createInvoice(@RequestBody InvoiceRequest dto,
                       @RequestHeader("Authorization") String token);
}
