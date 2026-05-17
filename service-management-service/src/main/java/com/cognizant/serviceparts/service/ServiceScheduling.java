package com.cognizant.serviceparts.service;

import com.cognizant.serviceparts.client.CrmFeignClient;
import com.cognizant.serviceparts.client.FinanceFeignClient;
import com.cognizant.serviceparts.client.InventoryFeignClient;
import com.cognizant.serviceparts.dto.*;
import com.cognizant.serviceparts.entity.*;
import com.cognizant.serviceparts.exception.ResourceNotFoundException;
import com.cognizant.serviceparts.repository.*;
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

    return appointmentRepository.save(appointment);
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
                .reportedIssues(request.getReportedIssues())
                .estimatedHours(request.getEstimatedHours())
                .partsRequired(request.getPartsRequired())
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

        workOrder.setReportedIssues(request.getReportedIssues());
        workOrder.setEstimatedHours(request.getEstimatedHours());
        workOrder.setPartsRequired(request.getPartsRequired());

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
                .findings(request.getFindings())
                .actions(request.getActions())
                .photos(request.getPhotos())
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

        jobCard.setFindings(request.getFindings());
        jobCard.setActions(request.getActions());
        jobCard.setPhotos(request.getPhotos());

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

        if (jobCard.getStatus() != JobCard.JobCardStatus.IN_PROGRESS) {
            throw new RuntimeException(
                    "Job must be IN_PROGRESS to be completed. Current status: " + jobCard.getStatus());
        }

        // Populate completion fields
        if (request.getFindings() != null) jobCard.setFindings(request.getFindings());
        if (request.getActions()  != null) jobCard.setActions(request.getActions());
        if (request.getPhotos()   != null) jobCard.setPhotos(request.getPhotos());

        jobCard.setEndAt(LocalDateTime.now());
        jobCard.setSignedOffBy(request.getSignedOffBy());
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

        return saved;
    }

    // ────────────────────────────────────────────────────────
    //  Private helpers
    // ────────────────────────────────────────────────────────

    private void triggerInvoice(WorkOrder workOrder, JobCard jobCard, String token) {
        try {
            InvoiceRequest invoiceRequest = InvoiceRequest.builder()
                    .customerId(workOrder.getAppointment().getCustomerId())
                    .relatedEntityType("WORK_ORDER")
                    .relatedEntityId(workOrder.getWoId())
                    .subTotal(java.math.BigDecimal.ZERO)
                    .taxAmount(java.math.BigDecimal.ZERO)
                    .dueAt(LocalDateTime.now().plusDays(30))
                    .vehicleId(workOrder.getVehicleId())
                    .workOrderId(workOrder.getWoId())
                    .jobCardId(jobCard.getJobId())
                    .serviceDate(jobCard.getEndAt())
                    .notes("Auto-generated invoice for Work Order ID: " + workOrder.getWoId())
                    .build();

            financeFeignClient.createInvoice(invoiceRequest, token);
            log.info("Invoice successfully triggered for Work Order ID: {}", workOrder.getWoId());

        } catch (Exception e) {
            log.error("Failed to trigger invoice for Work Order ID {}: {}",
                    workOrder.getWoId(), e.getMessage());
        }
    }
}

