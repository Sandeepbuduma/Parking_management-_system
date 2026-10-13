package com.smartparking.repository;

import com.smartparking.entity.ParkingSlot;
import com.smartparking.entity.enums.SlotStatus;
import com.smartparking.entity.enums.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {

    List<ParkingSlot> findByLocationId(Long locationId);

    List<ParkingSlot> findByLocationIdAndStatus(Long locationId, SlotStatus status);

    List<ParkingSlot> findByStatus(SlotStatus status);

    long countByStatus(SlotStatus status);

    boolean existsByLocationIdAndSlotNumber(Long locationId, String slotNumber);

    boolean existsByLocationIdAndSlotNumberAndIdNot(Long locationId, String slotNumber, Long id);

    @Query("SELECT s FROM ParkingSlot s WHERE " +
           "(:locationId IS NULL OR s.location.id = :locationId) AND " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:vehicleType IS NULL OR s.vehicleType = :vehicleType) AND " +
           "(:floorNumber IS NULL OR s.floorNumber = :floorNumber) " +
           "ORDER BY s.floorNumber ASC, s.slotNumber ASC")
    List<ParkingSlot> findSlotsWithFilters(
            @Param("locationId") Long locationId,
            @Param("status") SlotStatus status,
            @Param("vehicleType") VehicleType vehicleType,
            @Param("floorNumber") Integer floorNumber
    );
}
