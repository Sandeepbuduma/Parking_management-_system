package com.smartparking.service;

import com.smartparking.dto.ReservationRequest;
import com.smartparking.dto.ReservationResponse;
import com.smartparking.dto.SessionResponse;
import com.smartparking.entity.*;
import com.smartparking.entity.enums.*;
import com.smartparking.exception.BadRequestException;
import com.smartparking.exception.ConflictException;
import com.smartparking.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BillingAndReservationLogicTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private ParkingSlotRepository slotRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private ParkingSessionRepository sessionRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private ReservationService reservationService;

    @InjectMocks
    private ParkingSessionService parkingSessionService;

    private User customer;
    private Vehicle vehicle;
    private ParkingLocation location;
    private ParkingSlot slot;

    @BeforeEach
    void setUp() {
        customer = new User("John Doe", "john@example.com", "secret", "1234567890", Role.CUSTOMER);
        customer.setId(10L);

        vehicle = new Vehicle(customer, "TEST-1234", VehicleType.FOUR_WHEELER, "Toyota", "Camry", "Silver");
        vehicle.setId(20L);

        location = new ParkingLocation("Downtown Mall", "123 Main St", "Mall parking", 3, "06:00", "23:00", true);
        location.setId(1L);

        slot = new ParkingSlot(location, "A-101", 1, VehicleType.FOUR_WHEELER, new BigDecimal("20.00"), SlotStatus.AVAILABLE);
        slot.setId(100L);
    }

    @Test
    @DisplayName("Should prevent double booking when overlapping reservation exists")
    void testOverlappingReservationConflict() {
        LocalDateTime start = LocalDateTime.now().plusHours(2);
        LocalDateTime end = LocalDateTime.now().plusHours(4);

        ReservationRequest request = new ReservationRequest(vehicle.getId(), slot.getId(), start, end);

        when(vehicleRepository.findById(vehicle.getId())).thenReturn(Optional.of(vehicle));
        when(slotRepository.findById(slot.getId())).thenReturn(Optional.of(slot));

        // Existing reservation conflicts
        Reservation existingConflicting = new Reservation("EXISTING-1", customer, vehicle, slot, start.plusMinutes(30), end.plusHours(1), ReservationStatus.CONFIRMED, new BigDecimal("40.00"));
        when(reservationRepository.findOverlappingReservations(eq(slot.getId()), any(), any(), any(), isNull()))
                .thenReturn(List.of(existingConflicting));

        assertThrows(ConflictException.class, () -> reservationService.createReservation(customer, request));
        verify(reservationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should calculate estimated fee based on rounded hours and hourly rate")
    void testEstimatedCostCalculation() {
        LocalDateTime start = LocalDateTime.now().plusHours(1);
        LocalDateTime end = start.plusMinutes(90); // 1.5 hours -> should round up to 2 hours

        ReservationRequest request = new ReservationRequest(vehicle.getId(), slot.getId(), start, end);

        when(vehicleRepository.findById(vehicle.getId())).thenReturn(Optional.of(vehicle));
        when(slotRepository.findById(slot.getId())).thenReturn(Optional.of(slot));
        when(reservationRepository.findOverlappingReservations(eq(slot.getId()), any(), any(), any(), isNull()))
                .thenReturn(Collections.emptyList());

        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> {
            Reservation r = invocation.getArgument(0);
            r.setId(555L);
            return r;
        });

        ReservationResponse response = reservationService.createReservation(customer, request);

        assertNotNull(response);
        // 2 hours * $20.00 = $40.00
        assertEquals(new BigDecimal("40.00"), response.getEstimatedAmount());
        assertEquals(ReservationStatus.CONFIRMED, response.getStatus());
    }

    @Test
    @DisplayName("Should reject reservation when end time is before start time")
    void testInvalidTimeRange() {
        LocalDateTime start = LocalDateTime.now().plusHours(3);
        LocalDateTime end = LocalDateTime.now().plusHours(1); // Invalid: end before start

        ReservationRequest request = new ReservationRequest(vehicle.getId(), slot.getId(), start, end);

        assertThrows(BadRequestException.class, () -> reservationService.createReservation(customer, request));
    }
}
