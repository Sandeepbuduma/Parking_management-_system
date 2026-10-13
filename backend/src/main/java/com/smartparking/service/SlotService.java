package com.smartparking.service;

import com.smartparking.dto.SlotRequest;
import com.smartparking.dto.SlotResponse;
import com.smartparking.entity.ParkingLocation;
import com.smartparking.entity.ParkingSlot;
import com.smartparking.entity.User;
import com.smartparking.entity.enums.ReservationStatus;
import com.smartparking.entity.enums.SlotStatus;
import com.smartparking.entity.enums.VehicleType;
import com.smartparking.exception.BadRequestException;
import com.smartparking.exception.ConflictException;
import com.smartparking.exception.ResourceNotFoundException;
import com.smartparking.mapper.DtoMapper;
import com.smartparking.repository.ParkingLocationRepository;
import com.smartparking.repository.ParkingSlotRepository;
import com.smartparking.repository.ReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SlotService {

    private final ParkingSlotRepository slotRepository;
    private final ParkingLocationRepository locationRepository;
    private final ReservationRepository reservationRepository;
    private final AuditLogService auditLogService;

    public SlotService(ParkingSlotRepository slotRepository,
                       ParkingLocationRepository locationRepository,
                       ReservationRepository reservationRepository,
                       AuditLogService auditLogService) {
        this.slotRepository = slotRepository;
        this.locationRepository = locationRepository;
        this.reservationRepository = reservationRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<SlotResponse> getSlotsByLocation(Long locationId) {
        return slotRepository.findByLocationId(locationId)
                .stream()
                .map(DtoMapper::toSlotResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SlotResponse> getAvailableSlots(Long locationId, VehicleType vehicleType) {
        return slotRepository.findSlotsWithFilters(locationId, SlotStatus.AVAILABLE, vehicleType, null)
                .stream()
                .map(DtoMapper::toSlotResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SlotResponse> getAllSlotsWithFilters(Long locationId, SlotStatus status, VehicleType vehicleType, Integer floorNumber) {
        return slotRepository.findSlotsWithFilters(locationId, status, vehicleType, floorNumber)
                .stream()
                .map(DtoMapper::toSlotResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SlotResponse getSlotById(Long id) {
        ParkingSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + id));
        return DtoMapper.toSlotResponse(slot);
    }

    @Transactional
    public SlotResponse createSlot(SlotRequest request, User adminUser) {
        ParkingLocation loc = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + request.getLocationId()));

        if (request.getFloorNumber() > loc.getTotalFloors()) {
            throw new BadRequestException("Floor number " + request.getFloorNumber() + " exceeds location's total floors (" + loc.getTotalFloors() + ")");
        }

        if (slotRepository.existsByLocationIdAndSlotNumber(request.getLocationId(), request.getSlotNumber().trim().toUpperCase())) {
            throw new ConflictException("Slot number " + request.getSlotNumber() + " already exists in location " + loc.getName());
        }

        ParkingSlot slot = new ParkingSlot();
        slot.setLocation(loc);
        slot.setSlotNumber(request.getSlotNumber().trim().toUpperCase());
        slot.setFloorNumber(request.getFloorNumber());
        slot.setVehicleType(request.getVehicleType());
        slot.setHourlyRate(request.getHourlyRate());
        slot.setStatus(request.getStatus() != null ? request.getStatus() : SlotStatus.AVAILABLE);

        ParkingSlot saved = slotRepository.save(slot);
        auditLogService.record(adminUser, "CREATE_SLOT", "ParkingSlot", saved.getId(),
                "Created slot " + saved.getSlotNumber() + " in " + loc.getName());

        return DtoMapper.toSlotResponse(saved);
    }

    @Transactional
    public SlotResponse updateSlot(Long id, SlotRequest request, User adminUser) {
        ParkingSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + id));

        ParkingLocation loc = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + request.getLocationId()));

        if (request.getFloorNumber() > loc.getTotalFloors()) {
            throw new BadRequestException("Floor number exceeds location total floors");
        }

        if (slotRepository.existsByLocationIdAndSlotNumberAndIdNot(request.getLocationId(), request.getSlotNumber().trim().toUpperCase(), id)) {
            throw new ConflictException("Slot number " + request.getSlotNumber() + " already exists in this location");
        }

        slot.setLocation(loc);
        slot.setSlotNumber(request.getSlotNumber().trim().toUpperCase());
        slot.setFloorNumber(request.getFloorNumber());
        slot.setVehicleType(request.getVehicleType());
        slot.setHourlyRate(request.getHourlyRate());
        if (request.getStatus() != null) {
            slot.setStatus(request.getStatus());
        }

        ParkingSlot saved = slotRepository.save(slot);
        auditLogService.record(adminUser, "UPDATE_SLOT", "ParkingSlot", saved.getId(),
                "Updated slot " + saved.getSlotNumber());

        return DtoMapper.toSlotResponse(saved);
    }

    @Transactional
    public void deleteSlot(Long id, User adminUser) {
        ParkingSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + id));

        // Check active reservations
        var activeReservations = reservationRepository.findOverlappingReservations(
                id,
                java.time.LocalDateTime.now(),
                java.time.LocalDateTime.now().plusYears(1),
                List.of(ReservationStatus.CONFIRMED, ReservationStatus.ACTIVE, ReservationStatus.PENDING),
                null
        );

        if (!activeReservations.isEmpty()) {
            throw new BadRequestException("Cannot delete slot with active or upcoming reservations. Mark as MAINTENANCE instead.");
        }

        slotRepository.delete(slot);
        auditLogService.record(adminUser, "DELETE_SLOT", "ParkingSlot", id,
                "Deleted slot " + slot.getSlotNumber());
    }
}
