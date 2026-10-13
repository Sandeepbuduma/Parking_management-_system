package com.smartparking.service;

import com.smartparking.dto.SessionResponse;
import com.smartparking.entity.*;
import com.smartparking.entity.enums.NotificationType;
import com.smartparking.entity.enums.PaymentStatus;
import com.smartparking.entity.enums.ReservationStatus;
import com.smartparking.entity.enums.Role;
import com.smartparking.entity.enums.SlotStatus;
import com.smartparking.exception.BadRequestException;
import com.smartparking.exception.ForbiddenException;
import com.smartparking.exception.ResourceNotFoundException;
import com.smartparking.mapper.DtoMapper;
import com.smartparking.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ParkingSessionService {

    private final ParkingSessionRepository sessionRepository;
    private final ReservationRepository reservationRepository;
    private final ParkingSlotRepository slotRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public ParkingSessionService(ParkingSessionRepository sessionRepository,
                                 ReservationRepository reservationRepository,
                                 ParkingSlotRepository slotRepository,
                                 PaymentRepository paymentRepository,
                                 NotificationService notificationService,
                                 AuditLogService auditLogService) {
        this.sessionRepository = sessionRepository;
        this.reservationRepository = reservationRepository;
        this.slotRepository = slotRepository;
        this.paymentRepository = paymentRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public SessionResponse checkIn(Long reservationId, User currentUser) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        if (!reservation.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("You cannot check in for another user's reservation");
        }

        if (reservation.getStatus() == ReservationStatus.ACTIVE) {
            throw new BadRequestException("This reservation is already checked in and active");
        }

        if (reservation.getStatus() != ReservationStatus.CONFIRMED && reservation.getStatus() != ReservationStatus.PENDING) {
            throw new BadRequestException("Cannot check in for a reservation with status: " + reservation.getStatus());
        }

        LocalDateTime now = LocalDateTime.now();
        reservation.setActualCheckIn(now);
        reservation.setStatus(ReservationStatus.ACTIVE);
        reservationRepository.save(reservation);

        // Update slot to OCCUPIED
        ParkingSlot slot = reservation.getSlot();
        slot.setStatus(SlotStatus.OCCUPIED);
        slotRepository.save(slot);

        // Create or get parking session
        ParkingSession session = sessionRepository.findByReservationId(reservationId)
                .orElseGet(() -> new ParkingSession(reservation, now, slot.getHourlyRate()));

        session.setCheckInTime(now);
        session.setCheckOutTime(null);
        session.setPaymentStatus(PaymentStatus.PENDING);
        ParkingSession saved = sessionRepository.save(session);

        notificationService.createNotification(
                reservation.getUser(),
                "Vehicle Checked In",
                "Your vehicle " + reservation.getVehicle().getRegistrationNumber() + " has checked into slot "
                        + slot.getSlotNumber() + " at " + now,
                NotificationType.INFO
        );

        if (currentUser.getRole() == Role.ADMIN) {
            auditLogService.record(currentUser, "CHECK_IN", "ParkingSession", saved.getId(),
                    "Recorded check-in for booking " + reservation.getBookingReference());
        }

        return DtoMapper.toSessionResponse(saved);
    }

    @Transactional
    public SessionResponse checkOut(Long reservationId, User currentUser) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        if (!reservation.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("You cannot check out for another user's reservation");
        }

        ParkingSession session = sessionRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new BadRequestException("No parking session found for reservation " + reservationId));

        if (session.getCheckOutTime() != null) {
            throw new BadRequestException("This parking session has already been checked out");
        }

        LocalDateTime checkOutTime = LocalDateTime.now();
        session.setCheckOutTime(checkOutTime);
        reservation.setActualCheckOut(checkOutTime);

        // Duration calculation: round up to full hour, minimum 1 hour
        long durationMinutes = Duration.between(session.getCheckInTime(), checkOutTime).toMinutes();
        session.setDurationMinutes(durationMinutes);

        long billedHours = Math.max(1, (long) Math.ceil(durationMinutes / 60.0));
        BigDecimal finalAmount = session.getHourlyRate().multiply(BigDecimal.valueOf(billedHours));

        session.setTotalAmount(finalAmount);
        session.setPaymentStatus(PaymentStatus.PAID);
        ParkingSession savedSession = sessionRepository.save(session);

        reservation.setFinalAmount(finalAmount);
        reservation.setStatus(ReservationStatus.COMPLETED);
        reservationRepository.save(reservation);

        // Free slot back to AVAILABLE
        ParkingSlot slot = reservation.getSlot();
        slot.setStatus(SlotStatus.AVAILABLE);
        slotRepository.save(slot);

        // Record payment transaction
        String txnRef = "TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
        Payment payment = new Payment(
                reservation,
                finalAmount,
                "ONLINE",
                PaymentStatus.PAID,
                txnRef,
                checkOutTime
        );
        paymentRepository.save(payment);

        notificationService.createNotification(
                reservation.getUser(),
                "Checkout & Payment Completed",
                "Your session for slot " + slot.getSlotNumber() + " has ended. Duration: " + durationMinutes
                        + " mins (" + billedHours + " hr(s) billed). Total fee: $" + finalAmount
                        + ". Transaction: " + txnRef,
                NotificationType.SUCCESS
        );

        if (currentUser.getRole() == Role.ADMIN) {
            auditLogService.record(currentUser, "CHECK_OUT", "ParkingSession", savedSession.getId(),
                    "Recorded check-out for booking " + reservation.getBookingReference() + ", amount: $" + finalAmount);
        }

        return DtoMapper.toSessionResponse(savedSession);
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getActiveSessions() {
        return sessionRepository.findByCheckOutTimeIsNullOrderByCheckInTimeDesc()
                .stream()
                .map(DtoMapper::toSessionResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getAllSessions() {
        return sessionRepository.findAllByOrderByCheckInTimeDesc()
                .stream()
                .map(DtoMapper::toSessionResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getUserSessions(Long userId) {
        return sessionRepository.findByUserId(userId)
                .stream()
                .map(DtoMapper::toSessionResponse)
                .collect(Collectors.toList());
    }
}
