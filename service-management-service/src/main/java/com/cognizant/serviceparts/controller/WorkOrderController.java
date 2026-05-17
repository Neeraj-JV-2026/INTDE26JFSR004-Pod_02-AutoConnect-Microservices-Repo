package com.cognizant.serviceparts.controller;

import com.cognizant.serviceparts.dto.ApiResponse;
import com.cognizant.serviceparts.dto.AssignTechnicianRequest;
import com.cognizant.serviceparts.dto.WorkOrderRequest;
import com.cognizant.serviceparts.entity.WorkOrder;
import com.cognizant.serviceparts.service.ServiceScheduling;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class WorkOrderController {

    private final ServiceScheduling serviceScheduling;

    @PostMapping("/workorders")
    @PreAuthorize("hasAnyAuthority('SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<WorkOrder>> createWorkOrder(
            @Valid @RequestBody WorkOrderRequest request) {
        WorkOrder workOrder = serviceScheduling.createWorkOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Work order created successfully", workOrder));
    }

    @GetMapping("/workorders")
    @PreAuthorize("hasAnyAuthority('SERVICE_ADVISOR', 'TECHNICIAN', 'ADMIN', 'AUDITOR')")
    public ResponseEntity<ApiResponse<List<WorkOrder>>> getAllWorkOrders() {
        List<WorkOrder> workOrders = serviceScheduling.getAllWorkOrders();
        return ResponseEntity.ok(ApiResponse.success(workOrders));
    }

    @GetMapping("/workorders/{id}")
    @PreAuthorize("hasAnyAuthority('SERVICE_ADVISOR', 'TECHNICIAN', 'ADMIN', 'AUDITOR')")
    public ResponseEntity<ApiResponse<WorkOrder>> getWorkOrderById(@PathVariable Long id) {
        WorkOrder workOrder = serviceScheduling.getWorkOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(workOrder));
    }

    @PutMapping("/workorders/{id}")
    @PreAuthorize("hasAnyAuthority('SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<WorkOrder>> updateWorkOrder(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderRequest request) {
        WorkOrder workOrder = serviceScheduling.updateWorkOrder(id, request);
        return ResponseEntity.ok(ApiResponse.success("Work order updated successfully", workOrder));
    }

    @PostMapping("/workorders/{id}/assign-technician")
    @PreAuthorize("hasAnyAuthority('SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<WorkOrder>> assignTechnician(
            @PathVariable Long id,
            @Valid @RequestBody AssignTechnicianRequest request,
            @RequestHeader(value = "Authorization", required = false) String token) {
        WorkOrder workOrder = serviceScheduling.assignTechnician(id, request, token);
        return ResponseEntity.ok(ApiResponse.success("Technician assigned successfully", workOrder));
    }
}
