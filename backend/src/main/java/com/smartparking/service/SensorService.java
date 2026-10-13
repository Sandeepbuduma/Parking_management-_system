package com.smartparking.service;

import com.smartparking.dto.SensorSimulationRequest;
import com.smartparking.dto.SlotResponse;
import com.smartparking.entity.ParkingSlot;
import com.smartparking.entity.User;
import com.smartparking.entity.enums.ReservationStatus;
import com.smartparking.entity.enums.SlotStatus;
import com.smartparking.exception.BadRequestException;
import com.smartparking.exception.ResourceNotFoundException;
import com.smartparking.mapper.DtoMapper;
import com.smartparking.repository.ParkingSlotRepository;
import com.smartparking.repository.ReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SensorService {

    private final ParkingSlotRepository slotRepository;
    private final ReservationRepository reservationRepository;
    private final AuditLogService auditLogService;

    public SensorService(ParkingSlotRepository slotRepository,
                         ReservationRepository reservationRepository,
                         AuditLogService auditLogService) {
        this.slotRepository = slotRepository;
        this.reservationRepository = reservationRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public SlotResponse simulateSensorEvent(SensorSimulationRequest request, User adminUser) {
        ParkingSlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + request.getSlotId()));

        if (slot.getStatus() == SlotStatus.MAINTENANCE) {
            throw new BadRequestException("Cannot simulate sensor events for slot under maintenance");
        }

        LocalDateTime now = LocalDateTime.now();
        if (request.getOccupied()) {
            slot.setStatus(SlotStatus.OCCUPIED);
        } else {
            // Check if there is an active reservation currently for this slot
            var activeRes = reservationRepository.findOverlappingReservations(
                    slot.getId(),
                    now,
                    now.plusMinutes(1),
                    List.of(ReservationStatus.ACTIVE, ReservationStatus.CONFIRMED),
                    null
            );

            if (!activeRes.isEmpty()) {
                slot.setStatus(SlotStatus.RESERVED);
            } else {
                slot.setStatus(SlotStatus.AVAILABLE);
            }
        }

        ParkingSlot saved = slotRepository.save(slot);

        auditLogService.record(
                adminUser,
                "SENSOR_SIMULATION_EVENT",
                "ParkingSlot",
                slot.getId(),
                "Simulated IoT sensor update for slot " + slot.getSlotNumber() + " -> " + (request.getOccupied() ? "OCCUPIED" : "VACANT")
        );

        return DtoMapper.toSlotResponse(saved);
    }
}
