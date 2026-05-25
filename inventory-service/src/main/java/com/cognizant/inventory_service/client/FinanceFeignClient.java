package com.cognizant.inventory_service.client;

import org.springframework.cloud.openfeign.FeignClient;

/**
 * Placeholder retained for future finance integration from inventory-service.
 * Recall and part stock notifications now route through NotificationFeignClient.
 */
@FeignClient(name = "finance-service", contextId = "inventoryFinanceFeignClient")
public interface FinanceFeignClient {
    // No active methods — notifications moved to NotificationFeignClient
}
