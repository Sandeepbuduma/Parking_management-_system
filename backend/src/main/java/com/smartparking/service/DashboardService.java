package com.smartparking.service;

import com.smartparking.dto.AdminDashboardStats;
import com.smartparking.dto.CustomerDashboardStats;
import com.smartparking.entity.ParkingLocation;
import com.smartparking.entity.ParkingSlot;
import com.smartparking.entity.Reservation;
import com.smartparking.entity.enums.PaymentStatus;
import com.smartparking.entity.enums.ReservationStatus;
import com.smartparking.entity.enums.Role;
import com.smartparking.entity.enums.SlotStatus;
import com.smartparking.entity.enums.VehicleType;
import com.smartparking.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class DashboardService {

    private final ParkingLocationRepository locationRepository;
    private final ParkingSlotRepository slotRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final ParkingSessionRepository sessionRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;

    public DashboardService(ParkingLocationRepository locationRepository,
                            ParkingSlotRepository slotRepository,
                            ReservationRepository reservationRepository,
                            UserRepository userRepository,
                            VehicleRepository vehicleRepository,
                            ParkingSessionRepository sessionRepository,
                            PaymentRepository paymentRepository,
                            NotificationRepository notificationRepository) {
        this.locationRepository = locationRepository;
        this.slotRepository = slotRepository;
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.sessionRepository = sessionRepository;
        this.paymentRepository = paymentRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardStats getAdminStats() {
        AdminDashboardStats stats = new AdminDashboardStats();

        long totalLocs = locationRepository.count();
        long totalSlots = slotRepository.count();
        long available = slotRepository.countByStatus(SlotStatus.AVAILABLE);
        long occupied = slotRepository.countByStatus(SlotStatus.OCCUPIED);
        long reserved = slotRepository.countByStatus(SlotStatus.RESERVED);
        long maintenance = slotRepository.countByStatus(SlotStatus.MAINTENANCE);

        long activeRes = reservationRepository.countActiveOrConfirmedReservations();
        long totalRes = reservationRepository.count();
        BigDecimal revenue = paymentRepository.sumAmountByStatus(PaymentStatus.PAID);
        long customers = userRepository.countByRole(Role.CUSTOMER);
        long vehicles = vehicleRepository.count();
        long activeSessions = sessionRepository.countByCheckOutTimeIsNull();

        double occupancyRate = 0.0;
        if (totalSlots > 0) {
            occupancyRate = Math.round(((double) (occupied + reserved) / totalSlots) * 1000.0) / 10.0;
        }

        Map<String, Long> vehicleTypeBreakdown = new HashMap<>();
        List<ParkingSlot> allSlots = slotRepository.findAll();
        for (VehicleType vt : VehicleType.values()) {
            long count = allSlots.stream().filter(s -> s.getVehicleType() == vt).count();
            vehicleTypeBreakdown.put(vt.name(), count);
        }

        stats.setTotalLocations(totalLocs);
        stats.setTotalSlots(totalSlots);
        stats.setAvailableSlots(available);
        stats.setOccupiedSlots(occupied);
        stats.setReservedSlots(reserved);
        stats.setMaintenanceSlots(maintenance);
        stats.setActiveReservations(activeRes);
        stats.setTotalReservations(totalRes);
        stats.setTotalRevenue(revenue != null ? revenue : BigDecimal.ZERO);
        stats.setTotalCustomers(customers);
        stats.setTotalVehicles(vehicles);
        stats.setActiveSessions(activeSessions);
        stats.setOccupancyRate(occupancyRate);
        stats.setSlotsByVehicleType(vehicleTypeBreakdown);

        return stats;
    }

    @Transactional(readOnly = true)
    public CustomerDashboardStats getCustomerStats(Long userId) {
        CustomerDashboardStats stats = new CustomerDashboardStats();

        List<Reservation> userRes = reservationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        long totalRes = userRes.size();
        long activeRes = userRes.stream().filter(r -> r.getStatus() == ReservationStatus.ACTIVE || r.getStatus() == ReservationStatus.CONFIRMED).count();
        long completedRes = userRes.stream().filter(r -> r.getStatus() == ReservationStatus.COMPLETED).count();

        long vehicles = vehicleRepository.findByUserId(userId).size();
        long unreadNotifs = notificationRepository.countByUserIdAndIsReadFalse(userId);

        BigDecimal totalSpent = userRes.stream()
                .filter(r -> r.getStatus() == ReservationStatus.COMPLETED && r.getFinalAmount() != null)
                .map(Reservation::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        stats.setTotalReservations(totalRes);
        stats.setActiveReservations(activeRes);
        stats.setCompletedReservations(completedRes);
        stats.setTotalVehicles(vehicles);
        stats.setTotalSpent(totalSpent);
        stats.setUnreadNotifications(unreadNotifs);

        return stats;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRevenueReport() {
        // Group recent completed reservations or payments by date
        var payments = paymentRepository.findAllByOrderByCreatedAtDesc();
        Map<String, BigDecimal> dateMap = new LinkedHashMap<>();

        // Last 7 days aggregation
        for (int i = 6; i >= 0; i--) {
            String dateStr = java.time.LocalDate.now().minusDays(i).toString();
            dateMap.put(dateStr, BigDecimal.ZERO);
        }

        for (var p : payments) {
            if (p.getPaidAt() != null) {
                String d = p.getPaidAt().toLocalDate().toString();
                if (dateMap.containsKey(d)) {
                    dateMap.put(d, dateMap.get(d).add(p.getAmount()));
                }
            }
        }

        List<Map<String, Object>> report = new ArrayList<>();
        dateMap.forEach((date, amount) -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", date);
            entry.put("amount", amount);
            report.add(entry);
        });

        return report;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getOccupancyReport() {
        List<ParkingLocation> locations = locationRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (ParkingLocation loc : locations) {
            var slots = slotRepository.findByLocationId(loc.getId());
            long total = slots.size();
            long occupied = slots.stream().filter(s -> s.getStatus() == SlotStatus.OCCUPIED || s.getStatus() == SlotStatus.RESERVED).count();
            double rate = total > 0 ? ((double) occupied / total) * 100.0 : 0.0;

            Map<String, Object> map = new HashMap<>();
            map.put("locationId", loc.getId());
            map.put("locationName", loc.getName());
            map.put("totalSlots", total);
            map.put("occupiedSlots", occupied);
            map.put("availableSlots", total - occupied);
            map.put("occupancyRate", Math.round(rate * 10.0) / 10.0);
            result.add(map);
        }

        return result;
    }
}
