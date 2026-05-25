package com.cognizant.inventory_service.repository;

import com.cognizant.inventory_service.entity.PartOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PartOrderRepository extends JpaRepository<PartOrder, Long> {

    List<PartOrder> findByPart_PartId(Long partId);

    List<PartOrder> findByStatus(PartOrder.PartOrderStatus status);

    List<PartOrder> findByOrderedBy(Long userId);
}
