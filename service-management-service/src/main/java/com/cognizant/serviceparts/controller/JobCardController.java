package com.cognizant.serviceparts.controller;

import com.cognizant.serviceparts.dto.ApiResponse;
import com.cognizant.serviceparts.dto.CompleteJobRequest;
import com.cognizant.serviceparts.dto.JobCardRequest;
import com.cognizant.serviceparts.entity.JobCard;
import com.cognizant.serviceparts.security.SecurityUtils;
import com.cognizant.serviceparts.service.ServiceScheduling;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobcards")
@RequiredArgsConstructor
public class JobCardController {

    private final ServiceScheduling serviceScheduling;
    private final SecurityUtils securityUtils;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<JobCard>> createJobCard(
            @Valid @RequestBody JobCardRequest request) {
        JobCard jobCard = serviceScheduling.createJobCard(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job card created successfully", jobCard));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SERVICE_ADVISOR', 'TECHNICIAN', 'ADMIN', 'AUDITOR')")
    public ResponseEntity<ApiResponse<JobCard>> getJobCardById(@PathVariable Long id) {
        JobCard jobCard = serviceScheduling.getJobCardById(id);
        // Technicians may only view job cards assigned to them
        if (securityUtils.isTechnician()) {
            Long currentUserId = securityUtils.getCurrentUserId();
            if (!jobCard.getTechnicianId().equals(currentUserId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied: you are not the assigned technician"));
            }
        }
        return ResponseEntity.ok(ApiResponse.success(jobCard));
    }

    /**
     * GET /api/jobcards/my — returns only the job cards assigned to the calling technician.
     */
    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('TECHNICIAN', 'SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<JobCard>>> getMyJobCards() {
        Long currentUserId = securityUtils.getCurrentUserId();
        List<JobCard> jobCards = serviceScheduling.getJobCardsByTechnician(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(jobCards));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SERVICE_ADVISOR', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<JobCard>> updateJobCard(
            @PathVariable Long id,
            @Valid @RequestBody JobCardRequest request) {
        JobCard jobCard = serviceScheduling.updateJobCard(id, request);
        return ResponseEntity.ok(ApiResponse.success("Job card updated successfully", jobCard));
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasAnyAuthority('TECHNICIAN', 'SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<JobCard>> startJob(@PathVariable Long id) {
        JobCard jobCard = serviceScheduling.startJob(id);
        return ResponseEntity.ok(ApiResponse.success("Job started successfully", jobCard));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyAuthority('TECHNICIAN', 'SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<JobCard>> completeJob(
            @PathVariable Long id,
            @Valid @RequestBody CompleteJobRequest request,
            @RequestHeader(value = "Authorization", required = false) String token) {
        JobCard jobCard = serviceScheduling.completeJob(id, request, token);
        return ResponseEntity.ok(ApiResponse.success(
                "Job completed and signed off. Invoice triggered.", jobCard));
    }
}
