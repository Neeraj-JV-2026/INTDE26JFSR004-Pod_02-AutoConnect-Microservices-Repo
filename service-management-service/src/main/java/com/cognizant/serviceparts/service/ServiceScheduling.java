package com.cognizant.serviceparts.service;

import com.cognizant.serviceparts.client.CrmFeignClient;
import com.cognizant.serviceparts.client.FinanceFeignClient;
import com.cognizant.serviceparts.client.InventoryFeignClient;
import com.cognizant.serviceparts.client.NotificationFeignClient;
import com.cognizant.serviceparts.dto.*;
import com.cognizant.serviceparts.entity.*;
import com.cognizant.serviceparts.exception.ResourceNotFoundException;
import com.cognizant.serviceparts.repository.*;
import com.cognizant.serviceparts.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ServiceScheduling {

    private final ServiceAppointmentRepository appointmentRepository;
    private final WorkOrderRepository workOrderRepository;
    private final JobCardRepository jobCardRepository;
    private final CrmFeignClient crmFeignClient;
    private final InventoryFeignClient inventoryFeignClient;
    private final FinanceFeignClient financeFeignClient;
    private final NotificationFeignClient notificationFeignClient;
    private final SecurityUtils securityUtils;

    // ════════════════════════════════════════════════════════
    //  APPOINTMENT
    // ════════════════════════════════════════════════════════

    public ServiceAppointment createAppointment(AppointmentRequest request, String token) {

    try {
        crmFeignClient.getCustomerById(request.getCustomerId(), token);
    } catch (Exception e) {
        log.warn("CRM service unavailable — skipping customer validation: {}", e.getMessage());
    }

    try {
        inventoryFeignClient.getVehicleById(request.getVehicleId(), token);
    } catch (Exception e) {
        log.warn("Inventory service unavailable — skipping vehicle validation: {}", e.getMessage());
    }

    ServiceAppointment appointment = ServiceAppointment.builder()
            .customerId(request.getCustomerId())
            .vehicleId(request.getVehicleId())
            .advisorId(request.getAdvisorId())
            .scheduledAt(request.getScheduledAt())
            .durationMinutes(request.getDurationMinutes())
            .serviceType(request.getServiceType())
            .status(ServiceAppointment.AppointmentStatus.BOOKED)
            .build();

    ServiceAppointment saved = appointmentRepository.save(appointment);

    // Notify customer that their appointment has been booked
    try {
        notificationFeignClient.sendNotification(token, NotificationRequestDTO.builder()
                .customerId(request.getCustomerId())
                .userId(request.getCustomerId())
                .channel("EMAIL")
                .notificationType("APPOINTMENT_BOOKED")
                .subject("Service Appointment Confirmed")
                .message("Your " + request.getServiceType() + " appointment has been booked for "
                        + request.getScheduledAt() + ". Appointment ID: " + saved.getAppId() + ".")
                .build());
    } catch (Exception e) {
        log.warn("Failed to send APPOINTMENT_BOOKED notification for appointment {}: {}", saved.getAppId(), e.getMessage());
    }

    return saved;
}

    @Transactional(readOnly = true)
    public List<ServiceAppointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public ServiceAppointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceAppointment", "id", id));
    }

    public ServiceAppointment updateAppointment(Long id, AppointmentRequest request) {
        ServiceAppointment appointment = getAppointmentById(id);

        if (appointment.getStatus() == ServiceAppointment.AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Completed appointments cannot be modified");
        }

        appointment.setAdvisorId(request.getAdvisorId());
        appointment.setScheduledAt(request.getScheduledAt());
        appointment.setDurationMinutes(request.getDurationMinutes());
        appointment.setServiceType(request.getServiceType());

        return appointmentRepository.save(appointment);
    }

    public void deleteAppointment(Long id) {
        ServiceAppointment appointment = getAppointmentById(id);

        if (appointment.getStatus() == ServiceAppointment.AppointmentStatus.IN_PROGRESS
                || appointment.getStatus() == ServiceAppointment.AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Cannot delete an appointment that is IN_PROGRESS or COMPLETED");
        }

        appointmentRepository.delete(appointment);
    }

    /**
     * Business API: transitions a BOOKED appointment to IN_PROGRESS,
     * which then allows a Work Order to be raised against it.
     */
    public ServiceAppointment scheduleAppointment(Long id) {
        ServiceAppointment appointment = getAppointmentById(id);

        // Idempotent: if already IN_PROGRESS (e.g. duplicate call or UI retry), return as-is.
        if (appointment.getStatus() == ServiceAppointment.AppointmentStatus.IN_PROGRESS) {
            return appointment;
        }

        if (appointment.getStatus() != ServiceAppointment.AppointmentStatus.BOOKED) {
            throw new RuntimeException("Only BOOKED appointments can be moved to IN_PROGRESS. Current status: "
                    + appointment.getStatus());
        }

        appointment.setStatus(ServiceAppointment.AppointmentStatus.IN_PROGRESS);
        return appointmentRepository.save(appointment);
    }

    // ════════════════════════════════════════════════════════
    //  WORK ORDER
    // ════════════════════════════════════════════════════════

    public WorkOrder createWorkOrder(WorkOrderRequest request) {
        ServiceAppointment appointment = getAppointmentById(request.getAppointmentId());

        // Business rule: appointment must be IN_PROGRESS (i.e. scheduled)
        if (appointment.getStatus() != ServiceAppointment.AppointmentStatus.IN_PROGRESS) {
            throw new RuntimeException(
                    "A Work Order can only be created for an IN_PROGRESS appointment. Current status: "
                    + appointment.getStatus());
        }

        // Business rule: one Work Order per appointment
        if (workOrderRepository.findByAppointment_AppId(appointment.getAppId()).isPresent()) {
            throw new RuntimeException(
                    "A Work Order already exists for Appointment ID: " + appointment.getAppId());
        }

        WorkOrder workOrder = WorkOrder.builder()
                .appointment(appointment)
                .advisorId(request.getAdvisorId())
                .vehicleId(appointment.getVehicleId())
                .reportedIssues(toJsonString(request.getReportedIssues()))
                .estimatedHours(request.getEstimatedHours())
                .partsRequired(toJsonString(request.getPartsRequired()))
                .status(WorkOrder.WorkOrderStatus.OPEN)
                .build();

        return workOrderRepository.save(workOrder);
    }

    @Transactional(readOnly = true)
    public List<WorkOrder> getAllWorkOrders() {
        return workOrderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public WorkOrder getWorkOrderById(Long id) {
        return workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", "id", id));
    }

    public WorkOrder updateWorkOrder(Long id, WorkOrderRequest request) {
        WorkOrder workOrder = getWorkOrderById(id);

        if (workOrder.getStatus() == WorkOrder.WorkOrderStatus.COMPLETED) {
            throw new RuntimeException("Completed Work Orders cannot be modified");
        }

        workOrder.setReportedIssues(toJsonString(request.getReportedIssues()));
        workOrder.setEstimatedHours(request.getEstimatedHours());
        workOrder.setPartsRequired(toJsonString(request.getPartsRequired()));

        return workOrderRepository.save(workOrder);
    }

    public WorkOrder assignTechnician(Long workOrderId, AssignTechnicianRequest request, String token) {
        WorkOrder workOrder = getWorkOrderById(workOrderId);

        if (workOrder.getStatus() == WorkOrder.WorkOrderStatus.COMPLETED) {
            throw new RuntimeException("Cannot assign a technician to a COMPLETED Work Order");
        }

        workOrder.setAssignedTechnician(request.getTechnicianId());
        workOrder.setStatus(WorkOrder.WorkOrderStatus.IN_PROGRESS);
        WorkOrder saved = workOrderRepository.save(workOrder);
        triggerTechnicianTask(saved, token);
        return saved;
    }

    private void triggerTechnicianTask(WorkOrder workOrder, String token) {
        try {
            com.cognizant.serviceparts.dto.TaskRequestDTO task =
                com.cognizant.serviceparts.dto.TaskRequestDTO.builder()
                    .assignedTo(workOrder.getAssignedTechnician())
                    .relatedEntityId(workOrder.getWoId())
                    .description("Repair Task: " + workOrder.getReportedIssues())
                    .dueDate(LocalDateTime.now().plusHours(4))
                    .priority("HIGH")
                    .build();
            financeFeignClient.createTask(token, task);
            log.info("Task created for Technician ID: {}", workOrder.getAssignedTechnician());
        } catch (Exception e) {
            log.error("Failed to trigger task creation", e);
        }

        // Notify the technician of their new assignment
        try {
            notificationFeignClient.sendNotification(token, NotificationRequestDTO.builder()
                    .userId(workOrder.getAssignedTechnician())
                    .channel("IN_APP")
                    .notificationType("TASK_ASSIGNED")
                    .subject("New Work Order Assigned — WO #" + workOrder.getWoId())
                    .message("You have been assigned Work Order #" + workOrder.getWoId()
                            + ". Reported issue: " + workOrder.getReportedIssues()
                            + ". Please begin work within 4 hours.")
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send TASK_ASSIGNED notification for work order {}: {}", workOrder.getWoId(), e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════
    //  JOB CARD
    // ════════════════════════════════════════════════════════

    public JobCard createJobCard(JobCardRequest request) {
        WorkOrder workOrder = getWorkOrderById(request.getWorkOrderId());

        // Business rule: technician must be assigned first
        if (workOrder.getAssignedTechnician() == null) {
            throw new RuntimeException(
                    "A technician must be assigned to the Work Order before a Job Card can be created");
        }

        // Business rule: one Job Card per Work Order
        if (jobCardRepository.findByWorkOrder_WoId(workOrder.getWoId()).isPresent()) {
            throw new RuntimeException(
                    "A Job Card already exists for Work Order ID: " + workOrder.getWoId());
        }

        JobCard jobCard = JobCard.builder()
                .workOrder(workOrder)
                .technicianId(request.getTechnicianId())
                .findings(toJsonString(request.getFindings()))
                .actions(toJsonString(request.getActions()))
                .photos(toJsonString(request.getPhotos()))
                .status(JobCard.JobCardStatus.CREATED)
                .build();

        return jobCardRepository.save(jobCard);
    }

    @Transactional(readOnly = true)
    public JobCard getJobCardById(Long id) {
        return jobCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobCard", "id", id));
    }

    @Transactional(readOnly = true)
    public java.util.List<JobCard> getJobCardsByTechnician(Long technicianId) {
        return jobCardRepository.findByTechnicianId(technicianId);
    }

    public JobCard updateJobCard(Long id, JobCardRequest request) {
        JobCard jobCard = getJobCardById(id);

        if (jobCard.getStatus() == JobCard.JobCardStatus.SIGNED_OFF) {
            throw new RuntimeException("Signed-off Job Cards cannot be modified");
        }

        jobCard.setFindings(toJsonString(request.getFindings()));
        jobCard.setActions(toJsonString(request.getActions()));
        jobCard.setPhotos(toJsonString(request.getPhotos()));

        return jobCardRepository.save(jobCard);
    }

    /**
     * Business API: start job execution — CREATED → IN_PROGRESS.
     */
    public JobCard startJob(Long jobCardId) {
        JobCard jobCard = getJobCardById(jobCardId);

        if (jobCard.getStatus() != JobCard.JobCardStatus.CREATED) {
            throw new RuntimeException(
                    "Job can only be started from CREATED status. Current status: " + jobCard.getStatus());
        }

        jobCard.setStartAt(LocalDateTime.now());
        jobCard.setStatus(JobCard.JobCardStatus.IN_PROGRESS);
        return jobCardRepository.save(jobCard);
    }

    /**
     * Business API: complete job — IN_PROGRESS → SIGNED_OFF.
     * Also marks the Work Order and Appointment as COMPLETED,
     * then triggers invoice creation in the Finance service.
     */
    public JobCard completeJob(Long jobCardId, CompleteJobRequest request, String token) {
        JobCard jobCard = getJobCardById(jobCardId);

        // Idempotent: if the job was already signed off (e.g. duplicate submit or retry),
        // return it as-is without re-running the cascade or re-triggering the invoice.
        if (jobCard.getStatus() == JobCard.JobCardStatus.SIGNED_OFF) {
            return jobCard;
        }

        if (jobCard.getStatus() != JobCard.JobCardStatus.IN_PROGRESS) {
            throw new RuntimeException(
                    "Job must be IN_PROGRESS to be completed. Current status: " + jobCard.getStatus());
        }

        // Populate completion fields
        if (request.getFindings() != null) jobCard.setFindings(toJsonString(request.getFindings()));
        if (request.getActions()  != null) jobCard.setActions(toJsonString(request.getActions()));
        if (request.getPhotos()   != null) jobCard.setPhotos(toJsonString(request.getPhotos()));

        // Always resolve the sign-off user from the authenticated JWT principal;
        // fall back to the request body value only if the security context is unavailable.
        Long resolvedSignedOffBy = securityUtils.getCurrentUserId();
        if (resolvedSignedOffBy == null) resolvedSignedOffBy = request.getSignedOffBy();

        jobCard.setEndAt(LocalDateTime.now());
        jobCard.setSignedOffBy(resolvedSignedOffBy);
        jobCard.setSignedOffAt(LocalDateTime.now());
        jobCard.setStatus(JobCard.JobCardStatus.SIGNED_OFF);

        JobCard saved = jobCardRepository.save(jobCard);

        // Cascade: complete Work Order
        WorkOrder workOrder = jobCard.getWorkOrder();
        workOrder.setStatus(WorkOrder.WorkOrderStatus.COMPLETED);
        workOrderRepository.save(workOrder);

        // Cascade: complete Appointment
        ServiceAppointment appointment = workOrder.getAppointment();
        appointment.setStatus(ServiceAppointment.AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        // Trigger billing in Finance service
        triggerInvoice(workOrder, saved, token);

        // Notify customer that their vehicle service is complete
        try {
            Long customerId = workOrder.getAppointment().getCustomerId();
            notificationFeignClient.sendNotification(token, NotificationRequestDTO.builder()
                    .customerId(customerId)
                    .userId(customerId)
                    .channel("SMS")
                    .notificationType("SERVICE_COMPLETE")
                    .subject("Your Vehicle Service is Complete")
                    .message("The service for your vehicle (Work Order #" + workOrder.getWoId()
                            + ") has been completed and signed off. Your vehicle is ready for pickup. "
                            + "An invoice has been generated for your records.")
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send SERVICE_COMPLETE notification for job card {}: {}", jobCardId, e.getMessage());
        }

        return saved;
    }

    // ────────────────────────────────────────────────────────
    //  Private helpers
    // ────────────────────────────────────────────────────────

    /**
     * Ensures a value stored in a MySQL JSON column is valid JSON.
     * A plain text string like "Initial inspection" is not valid JSON on its own;
     * this method wraps it in JSON double-quotes so MySQL accepts it.
     * Values that are already valid JSON objects/arrays/strings are left unchanged.
     */
    private String toJsonString(String value) {
        if (value == null || value.isBlank()) return null;
        String s = value.trim();
        // Already a JSON object, array, or quoted string — store as-is
        if (s.startsWith("{") || s.startsWith("[") || (s.startsWith("\"") && s.endsWith("\""))) {
            return s;
        }
        // Wrap plain text as a JSON string literal
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }

    private void triggerInvoice(WorkOrder workOrder, JobCard jobCard, String token) {
        try {
            // Labor cost = estimatedHours × $150/hr standard rate (Finance Officer can adjust afterwards)
            java.math.BigDecimal laborRate = new java.math.BigDecimal("150.00");
            java.math.BigDecimal hours = workOrder.getEstimatedHours() != null
                    ? java.math.BigDecimal.valueOf(workOrder.getEstimatedHours())
                    : java.math.BigDecimal.ONE;
            java.math.BigDecimal subTotal = hours.multiply(laborRate)
                    .setScale(2, java.math.RoundingMode.HALF_UP);
            java.math.BigDecimal taxAmount = subTotal
                    .multiply(new java.math.BigDecimal("0.10"))
                    .setScale(2, java.math.RoundingMode.HALF_UP);

            InvoiceRequest invoiceRequest = InvoiceRequest.builder()
                    .customerId(workOrder.getAppointment().getCustomerId())
                    .relatedEntityType("WORK_ORDER")
                    .relatedEntityId(workOrder.getWoId())
                    .subTotal(subTotal)
                    .taxAmount(taxAmount)
                    .dueAt(LocalDateTime.now().plusDays(30))
                    .vehicleId(workOrder.getVehicleId())
                    .workOrderId(workOrder.getWoId())
                    .jobCardId(jobCard.getJobId())
                    .serviceDate(jobCard.getEndAt())
                    .notes("Auto-generated invoice for Work Order ID: " + workOrder.getWoId()
                            + " | Labor: " + hours + " hr(s) @ $150/hr")
                    .build();

            financeFeignClient.createInvoice(invoiceRequest, token);
            log.info("Invoice successfully triggered for Work Order ID: {}", workOrder.getWoId());

        } catch (Exception e) {
            log.error("Failed to trigger invoice for Work Order ID {}: {}",
                    workOrder.getWoId(), e.getMessage());
        }
    }
}

