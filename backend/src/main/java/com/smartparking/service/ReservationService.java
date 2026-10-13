package com.smartparking.service;

import com.smartparking.dto.ReservationRequest;
import com.smartparking.dto.ReservationResponse;
import com.smartparking.entity.ParkingSlot;
import com.smartparking.entity.Reservation;
import com.smartparking.entity.User;
import com.smartparking.entity.Vehicle;
import com.smartparking.entity.enums.NotificationType;
import com.smartparking.entity.enums.ReservationStatus;
import com.smartparking.entity.enums.Role;
import com.smartparking.entity.enums.SlotStatus;
import com.smartparking.exception.BadRequestException;
import com.smartparking.exception.ConflictException;
import com.smartparking.exception.ForbiddenException;
import com.smartparking.exception.ResourceNotFoundException;
import com.smartparking.mapper.DtoMapper;
import com.smartparking.repository.ParkingSlotRepository;
import com.smartparking.repository.ReservationRepository;
import com.smartparking.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ParkingSlotRepository slotRepository;
    private final VehicleRepository vehicleRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public ReservationService(ReservationRepository reservationRepository,
                              ParkingSlotRepository slotRepository,
                              VehicleRepository vehicleRepository,
                              NotificationService notificationService,
                              AuditLogService auditLogService) {
        this.reservationRepository = reservationRepository;
        this.slotRepository = slotRepository;
        this.vehicleRepository = vehicleRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public ReservationResponse createReservation(User user, ReservationRequest request) {
        LocalDateTime now = LocalDateTime.now();

        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new BadRequestException("Start time and end time are required");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BadRequestException("Reservation start time must be before end time");
        }

        // Allow max 10 minutes buffer for slight clock discrepancy
        if (request.getStartTime().isBefore(now.minusMinutes(10))) {
            throw new BadRequestException("Reservation start time cannot be in the past");
        }

        // Validate vehicle ownership
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + request.getVehicleId()));

        if (!vehicle.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("The selected vehicle does not belong to your account");
        }

        // Validate slot
        ParkingSlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + request.getSlotId()));

        if (slot.getStatus() == SlotStatus.MAINTENANCE) {
            throw new BadRequestException("Slot " + slot.getSlotNumber() + " is currently under maintenance");
        }

        if (!slot.getLocation().isActive()) {
            throw new BadRequestException("Location " + slot.getLocation().getName() + " is currently inactive");
        }

        // Vehicle type compatibility check
        if (slot.getVehicleType() != vehicle.getVehicleType()) {
            throw new BadRequestException("Slot " + slot.getSlotNumber() + " is designated for "
                    + slot.getVehicleType() + ", but your vehicle is " + vehicle.getVehicleType());
        }

        // Check double booking / overlapping reservations
        List<ReservationStatus> activeStatuses = Arrays.asList(
                ReservationStatus.PENDING,
                ReservationStatus.CONFIRMED,
                ReservationStatus.ACTIVE
        );

        List<Reservation> conflicts = reservationRepository.findOverlappingReservations(
                slot.getId(),
                request.getStartTime(),
                request.getEndTime(),
                activeStatuses,
                null
        );

        if (!conflicts.isEmpty()) {
            throw new ConflictException("Slot " + slot.getSlotNumber() + " is already reserved or occupied during the selected time period");
        }

        // Calculate estimated cost: minimum 1 hour, rounding up duration to nearest hour
        long durationMinutes = Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
        if (durationMinutes < 15) {
            throw new BadRequestException("Minimum booking duration is 15 minutes");
        }
        long hours = Math.max(1, (long) Math.ceil(durationMinutes / 60.0));
        BigDecimal estimatedAmount = slot.getHourlyRate().multiply(BigDecimal.valueOf(hours));

        String bookingReference = "SPK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Reservation reservation = new Reservation(
                bookingReference,
                user,
                vehicle,
                slot,
                request.getStartTime(),
                request.getEndTime(),
                ReservationStatus.CONFIRMED,
                estimatedAmount
        );

        Reservation saved = reservationRepository.save(reservation);

        // If reservation starts within the next hour or is ongoing, mark slot as RESERVED
        if (request.getStartTime().isBefore(now.plusHours(1)) && slot.getStatus() == SlotStatus.AVAILABLE) {
            slot.setStatus(SlotStatus.RESERVED);
            slotRepository.save(slot);
        }

        notificationService.createNotification(
                user,
                "Booking Confirmed: " + bookingReference,
                "Your reservation for slot " + slot.getSlotNumber() + " at " + slot.getLocation().getName()
                        + " has been confirmed for " + request.getStartTime() + " to " + request.getEndTime()
                        + ". Est. Amount: $" + estimatedAmount,
                NotificationType.SUCCESS
        );

        return DtoMapper.toReservationResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getUserReservations(Long userId) {
        return reservationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(DtoMapper::toReservationResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReservationResponse getReservationById(Long id, User currentUser) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));

        if (!res.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("You do not have access to this reservation");
        }

        return DtoMapper.toReservationResponse(res);
    }

    @Transactional
    public ReservationResponse cancelReservation(Long id, User currentUser) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));

        if (!res.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("You cannot cancel another user's reservation");
        }

        if (res.getStatus() == ReservationStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel an already completed reservation");
        }

        if (res.getStatus() == ReservationStatus.ACTIVE) {
            throw new BadRequestException("Cannot cancel an active parking session. Please check out instead.");
        }

        if (res.getStatus() == ReservationStatus.CANCELLED) {
            throw new BadRequestException("Reservation is already cancelled");
        }

        res.setStatus(ReservationStatus.CANCELLED);
        Reservation updated = reservationRepository.save(res);

        // Update slot back to AVAILABLE if it was RESERVED
        ParkingSlot slot = res.getSlot();
        if (slot.getStatus() == SlotStatus.RESERVED) {
            slot.setStatus(SlotStatus.AVAILABLE);
            slotRepository.save(slot);
        }

        notificationService.createNotification(
                res.getUser(),
                "Reservation Cancelled",
                "Your reservation " + res.getBookingReference() + " for slot " + slot.getSlotNumber() + " has been cancelled.",
                NotificationType.INFO
        );

        if (currentUser.getRole() == Role.ADMIN) {
            auditLogService.record(currentUser, "CANCEL_RESERVATION", "Reservation", res.getId(),
                    "Admin cancelled reservation " + res.getBookingReference());
        }

        return DtoMapper.toReservationResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getAllReservations(Long userId, ReservationStatus status, Long slotId) {
        return reservationRepository.searchReservations(userId, status, slotId)
                .stream()
                .map(DtoMapper::toReservationResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReservationResponse updateReservationStatus(Long id, ReservationStatus newStatus, User adminUser) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));

        ReservationStatus oldStatus = res.getStatus();
        res.setStatus(newStatus);
        Reservation updated = reservationRepository.save(res);

        if (newStatus == ReservationStatus.CANCELLED || newStatus == ReservationStatus.COMPLETED) {
            if (res.getSlot().getStatus() == SlotStatus.RESERVED || res.getSlot().getStatus() == SlotStatus.OCCUPIED) {
                res.getSlot().setStatus(SlotStatus.AVAILABLE);
                slotRepository.save(res.getSlot());
            }
        }

        auditLogService.record(adminUser, "UPDATE_RESERVATION_STATUS", "Reservation", res.getId(),
                "Admin changed status of " + res.getBookingReference() + " from " + oldStatus + " to " + newStatus);

        return DtoMapper.toReservationResponse(updated);
    }
}
