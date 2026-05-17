package com.cognizant.sales_service.client;

import com.cognizant.sales_service.dto.NotificationRequestDTO;
import com.cognizant.sales_service.dto.SaleInvoiceRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "finance-service")
public interface FinanceFeignClient {

    @PostMapping("/api/finance/notifications")
    void sendNotification(@RequestHeader("Authorization") String token,
                          @RequestBody NotificationRequestDTO dto);

    @PostMapping("/api/finance/invoices")
    void generateInvoice(@RequestHeader("Authorization") String token,
                         @RequestBody SaleInvoiceRequestDTO invoiceRequest);
}
