package com.cognizant.serviceparts.controller;

import com.cognizant.serviceparts.dto.ApiResponse;
import com.cognizant.serviceparts.dto.AppointmentRequest;
import com.cognizant.serviceparts.entity.ServiceAppointment;
import com.cognizant.serviceparts.service.ServiceScheduling;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class ServiceAppointmentController {

    private final ServiceScheduling serviceScheduling;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('SERVICE_ADVISOR', 'ADMIN', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<ServiceAppointment>> createAppointment(
            @Valid @RequestBody AppointmentRequest request,
            @RequestHeader(value = "Authorization", required = false) String token) {
        ServiceAppointment appointment = serviceScheduling.createAppointment(request, token);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment booked successfully", appointment));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SERVICE_ADVISOR', 'TECHNICIAN', 'ADMIN', 'AUDITOR', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ServiceAppointment>>> getAllAppointments() {
        List<ServiceAppointment> appointments = serviceScheduling.getAllAppointments();
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SERVICE_ADVISOR', 'TECHNICIAN', 'ADMIN', 'AUDITOR', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<ServiceAppointment>> getAppointmentById(@PathVariable Long id) {
        ServiceAppointment appointment = serviceScheduling.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success(appointment));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<ServiceAppointment>> updateAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentRequest request) {
        ServiceAppointment appointment = serviceScheduling.updateAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment updated successfully", appointment));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(@PathVariable Long id) {
        serviceScheduling.deleteAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment deleted successfully", null));
    }

    @PostMapping("/{id}/schedule")
    @PreAuthorize("hasAnyAuthority('SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<ServiceAppointment>> scheduleAppointment(@PathVariable Long id) {
        ServiceAppointment appointment = serviceScheduling.scheduleAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment scheduled and now IN_PROGRESS", appointment));
    }
}
