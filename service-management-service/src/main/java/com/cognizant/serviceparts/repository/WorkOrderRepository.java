package com.cognizant.serviceparts.repository;

import com.cognizant.serviceparts.entity.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    Optional<WorkOrder> findByAppointment_AppId(Long appId);

    List<WorkOrder> findByAssignedTechnician(Long technicianId);

    List<WorkOrder> findByStatus(WorkOrder.WorkOrderStatus status);

    List<WorkOrder> findByVehicleId(Long vehicleId);
}