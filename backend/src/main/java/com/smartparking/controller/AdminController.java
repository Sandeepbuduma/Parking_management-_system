package com.smartparking.controller;

import com.smartparking.dto.*;
import com.smartparking.entity.AuditLog;
import com.smartparking.entity.User;
import com.smartparking.entity.enums.ReservationStatus;
import com.smartparking.entity.enums.SlotStatus;
import com.smartparking.entity.enums.VehicleType;
import com.smartparking.service.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final LocationService locationService;
    private final SlotService slotService;
    private final ReservationService reservationService;
    private final VehicleService vehicleService;
    private final ParkingSessionService sessionService;
    private final PaymentService paymentService;
    private final DashboardService dashboardService;
    private final AuthService authService;
    private final SensorService sensorService;
    private final AuditLogService auditLogService;

    public AdminController(LocationService locationService,
                           SlotService slotService,
                           ReservationService reservationService,
                           VehicleService vehicleService,
                           ParkingSessionService sessionService,
                           PaymentService paymentService,
                           DashboardService dashboardService,
                           AuthService authService,
                           SensorService sensorService,
                           AuditLogService auditLogService) {
        this.locationService = locationService;
        this.slotService = slotService;
        this.reservationService = reservationService;
        this.vehicleService = vehicleService;
        this.sessionService = sessionService;
        this.paymentService = paymentService;
        this.dashboardService = dashboardService;
        this.authService = authService;
        this.sensorService = sensorService;
        this.auditLogService = auditLogService;
    }

    // Locations
    @GetMapping("/locations")
    public ResponseEntity<List<LocationResponse>> getAllLocations() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }

    @PostMapping("/locations")
    public ResponseEntity<LocationResponse> createLocation(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody LocationRequest request) {
        User adminUser = authService.getUserByEmail(userDetails.getUsername());
        return new ResponseEntity<>(locationService.createLocation(request, adminUser), HttpStatus.CREATED);
    }

    @PutMapping("/locations/{id}")
    public ResponseEntity<LocationResponse> updateLocation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody LocationRequest request) {
        User adminUser = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(locationService.updateLocation(id, request, adminUser));
    }

    @DeleteMapping("/locations/{id}")
    public ResponseEntity<Void> deleteLocation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User adminUser = authService.getUserByEmail(userDetails.getUsername());
        locationService.deleteLocation(id, adminUser);
        return ResponseEntity.noContent().build();
    }

    // Slots
    @GetMapping("/slots")
    public ResponseEntity<List<SlotResponse>> getAllSlots(
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) SlotStatus status,
            @RequestParam(required = false) VehicleType vehicleType,
            @RequestParam(required = false) Integer floorNumber) {
        return ResponseEntity.ok(slotService.getAllSlotsWithFilters(locationId, status, vehicleType, floorNumber));
    }

    @PostMapping("/slots")
    public ResponseEntity<SlotResponse> createSlot(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SlotRequest request) {
        User adminUser = authService.getUserByEmail(userDetails.getUsername());
        return new ResponseEntity<>(slotService.createSlot(request, adminUser), HttpStatus.CREATED);
    }

    @PutMapping("/slots/{id}")
    public ResponseEntity<SlotResponse> updateSlot(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody SlotRequest request) {
        User adminUser = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(slotService.updateSlot(id, request, adminUser));
    }

    @DeleteMapping("/slots/{id}")
    public ResponseEntity<Void> deleteSlot(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User adminUser = authService.getUserByEmail(userDetails.getUsername());
        slotService.deleteSlot(id, adminUser);
        return ResponseEntity.noContent().build();
    }

    // Reservations
    @GetMapping("/reservations")
    public ResponseEntity<List<ReservationResponse>> getAllReservations(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) ReservationStatus status,
            @RequestParam(required = false) Long slotId) {
        return ResponseEntity.ok(reservationService.getAllReservations(userId, status, slotId));
    }

    @PutMapping("/reservations/{id}/status")
    public ResponseEntity<ReservationResponse> updateReservationStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ReservationStatusUpdateRequest request) {
        User adminUser = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(reservationService.updateReservationStatus(id, request.getStatus(), adminUser));
    }

    // Customers
    @GetMapping("/customers")
    public ResponseEntity<List<UserResponse>> getAllCustomers() {
        return ResponseEntity.ok(authService.getAllCustomers());
    }

    @PutMapping("/customers/{id}/toggle-status")
    public ResponseEntity<UserResponse> toggleCustomerStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User adminUser = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(authService.toggleUserStatus(id, adminUser));
    }

    // Vehicles
    @GetMapping("/vehicles")
    public ResponseEntity<List<VehicleResponse>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    // Parking Sessions
    @GetMapping("/parking-sessions/active")
    public ResponseEntity<List<SessionResponse>> getActiveSessions() {
        return ResponseEntity.ok(sessionService.getActiveSessions());
    }

    @GetMapping("/parking-sessions/all")
    public ResponseEntity<List<SessionResponse>> getAllSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    // Payments
    @GetMapping("/payments")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    // Dashboard & Reports
    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDashboardStats> getAdminStats() {
        return ResponseEntity.ok(dashboardService.getAdminStats());
    }

    @GetMapping("/reports/revenue")
    public ResponseEntity<List<Map<String, Object>>> getRevenueReport() {
        return ResponseEntity.ok(dashboardService.getRevenueReport());
    }

    @GetMapping("/reports/occupancy")
    public ResponseEntity<List<Map<String, Object>>> getOccupancyReport() {
        return ResponseEntity.ok(dashboardService.getOccupancyReport());
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogService.getRecentLogs());
    }

    // IoT Sensor simulation
    @PostMapping("/sensor/simulate")
    public ResponseEntity<SlotResponse> simulateSensor(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SensorSimulationRequest request) {
        User adminUser = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(sensorService.simulateSensorEvent(request, adminUser));
    }
}
