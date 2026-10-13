package com.smartparking.config;

import com.smartparking.entity.*;
import com.smartparking.entity.enums.*;
import com.smartparking.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final ParkingLocationRepository locationRepository;
    private final ParkingSlotRepository slotRepository;
    private final VehicleRepository vehicleRepository;
    private final ReservationRepository reservationRepository;
    private final ParkingSessionRepository sessionRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      ParkingLocationRepository locationRepository,
                      ParkingSlotRepository slotRepository,
                      VehicleRepository vehicleRepository,
                      ReservationRepository reservationRepository,
                      ParkingSessionRepository sessionRepository,
                      PaymentRepository paymentRepository,
                      NotificationRepository notificationRepository,
                      AuditLogRepository auditLogRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.slotRepository = slotRepository;
        this.vehicleRepository = vehicleRepository;
        this.reservationRepository = reservationRepository;
        this.sessionRepository = sessionRepository;
        this.paymentRepository = paymentRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByEmail("admin@parking.com")) {
            logger.info("Demo data already seeded. Skipping initial seed.");
            return;
        }

        logger.info("Seeding initial demo data for Smart Parking Management System...");

        // 1. Create Admin User
        User admin = new User(
                "System Administrator",
                "admin@parking.com",
                passwordEncoder.encode("Admin@123"),
                "+1-800-555-0100",
                Role.ADMIN
        );
        admin = userRepository.save(admin);

        // 2. Create Customers
        User customer1 = new User(
                "Alex Johnson",
                "customer@parking.com",
                passwordEncoder.encode("Customer@123"),
                "+1-555-019-2834",
                Role.CUSTOMER
        );
        customer1 = userRepository.save(customer1);

        User customer2 = new User(
                "Jane Smith",
                "jane@parking.com",
                passwordEncoder.encode("Customer@123"),
                "+1-555-014-9982",
                Role.CUSTOMER
        );
        customer2 = userRepository.save(customer2);

        // 3. Create Parking Locations
        ParkingLocation loc1 = new ParkingLocation(
                "Downtown Grand Center",
                "100 Financial Way, City Core",
                "Modern multi-level automated facility with EV charging, 24/7 CCTV, and contactless access.",
                4,
                "06:00",
                "23:30",
                true
        );
        loc1 = locationRepository.save(loc1);

        ParkingLocation loc2 = new ParkingLocation(
                "Metro Express Terminal",
                "450 Transit Boulevard, Tech Hub",
                "Express transit parking near central rail hub, featuring spacious bays and dedicated two-wheeler zones.",
                3,
                "00:00",
                "23:59",
                true
        );
        loc2 = locationRepository.save(loc2);

        // 4. Create Slots for Location 1 (Downtown Grand Center - 4 floors)
        List<ParkingSlot> loc1Slots = new ArrayList<>();
        // Floor 1
        loc1Slots.add(new ParkingSlot(loc1, "A-101", 1, VehicleType.FOUR_WHEELER, new BigDecimal("25.00"), SlotStatus.AVAILABLE));
        loc1Slots.add(new ParkingSlot(loc1, "A-102", 1, VehicleType.FOUR_WHEELER, new BigDecimal("25.00"), SlotStatus.OCCUPIED));
        loc1Slots.add(new ParkingSlot(loc1, "A-103", 1, VehicleType.EV, new BigDecimal("35.00"), SlotStatus.AVAILABLE));
        loc1Slots.add(new ParkingSlot(loc1, "A-104", 1, VehicleType.TWO_WHEELER, new BigDecimal("15.00"), SlotStatus.AVAILABLE));
        loc1Slots.add(new ParkingSlot(loc1, "A-105", 1, VehicleType.TWO_WHEELER, new BigDecimal("15.00"), SlotStatus.RESERVED));

        // Floor 2
        loc1Slots.add(new ParkingSlot(loc1, "B-201", 2, VehicleType.FOUR_WHEELER, new BigDecimal("25.00"), SlotStatus.AVAILABLE));
        loc1Slots.add(new ParkingSlot(loc1, "B-202", 2, VehicleType.FOUR_WHEELER, new BigDecimal("25.00"), SlotStatus.AVAILABLE));
        loc1Slots.add(new ParkingSlot(loc1, "B-203", 2, VehicleType.EV, new BigDecimal("35.00"), SlotStatus.OCCUPIED));
        loc1Slots.add(new ParkingSlot(loc1, "B-204", 2, VehicleType.FOUR_WHEELER, new BigDecimal("25.00"), SlotStatus.MAINTENANCE));

        // Floor 3
        loc1Slots.add(new ParkingSlot(loc1, "C-301", 3, VehicleType.FOUR_WHEELER, new BigDecimal("20.00"), SlotStatus.AVAILABLE));
        loc1Slots.add(new ParkingSlot(loc1, "C-302", 3, VehicleType.TWO_WHEELER, new BigDecimal("12.00"), SlotStatus.AVAILABLE));
        loc1Slots.add(new ParkingSlot(loc1, "C-303", 3, VehicleType.FOUR_WHEELER, new BigDecimal("20.00"), SlotStatus.AVAILABLE));

        // Floor 4
        loc1Slots.add(new ParkingSlot(loc1, "D-401", 4, VehicleType.FOUR_WHEELER, new BigDecimal("18.00"), SlotStatus.AVAILABLE));
        loc1Slots.add(new ParkingSlot(loc1, "D-402", 4, VehicleType.FOUR_WHEELER, new BigDecimal("18.00"), SlotStatus.AVAILABLE));

        loc1Slots = slotRepository.saveAll(loc1Slots);

        // Create Slots for Location 2 (Metro Express Terminal - 3 floors)
        List<ParkingSlot> loc2Slots = new ArrayList<>();
        loc2Slots.add(new ParkingSlot(loc2, "M-101", 1, VehicleType.FOUR_WHEELER, new BigDecimal("22.00"), SlotStatus.AVAILABLE));
        loc2Slots.add(new ParkingSlot(loc2, "M-102", 1, VehicleType.FOUR_WHEELER, new BigDecimal("22.00"), SlotStatus.AVAILABLE));
        loc2Slots.add(new ParkingSlot(loc2, "M-103", 1, VehicleType.EV, new BigDecimal("30.00"), SlotStatus.AVAILABLE));
        loc2Slots.add(new ParkingSlot(loc2, "M-104", 1, VehicleType.TWO_WHEELER, new BigDecimal("10.00"), SlotStatus.AVAILABLE));
        loc2Slots.add(new ParkingSlot(loc2, "M-201", 2, VehicleType.FOUR_WHEELER, new BigDecimal("20.00"), SlotStatus.AVAILABLE));
        loc2Slots.add(new ParkingSlot(loc2, "M-202", 2, VehicleType.FOUR_WHEELER, new BigDecimal("20.00"), SlotStatus.AVAILABLE));
        loc2Slots.add(new ParkingSlot(loc2, "M-301", 3, VehicleType.FOUR_WHEELER, new BigDecimal("18.00"), SlotStatus.AVAILABLE));
        loc2Slots = slotRepository.saveAll(loc2Slots);

        // 5. Create Customer Vehicles
        Vehicle v1 = new Vehicle(customer1, "CA-8899-TX", VehicleType.FOUR_WHEELER, "Tesla", "Model 3", "Midnight Silver");
        v1 = vehicleRepository.save(v1);

        Vehicle v2 = new Vehicle(customer1, "NY-4321-BK", VehicleType.TWO_WHEELER, "Yamaha", "MT-07", "Matte Black");
        v2 = vehicleRepository.save(v2);

        Vehicle v3 = new Vehicle(customer2, "WA-9920-EV", VehicleType.EV, "Hyundai", "Ioniq 5", "Lucid White");
        v3 = vehicleRepository.save(v3);

        // 6. Create Completed Past Reservation with Session and Payment
        LocalDateTime yesterdayStart = LocalDateTime.now().minusDays(1).withHour(10).withMinute(0);
        LocalDateTime yesterdayEnd = LocalDateTime.now().minusDays(1).withHour(13).withMinute(0);
        Reservation pastRes = new Reservation(
                "SPK-PAST901",
                customer1,
                v1,
                loc1Slots.get(0), // A-101
                yesterdayStart,
                yesterdayEnd,
                ReservationStatus.COMPLETED,
                new BigDecimal("75.00")
        );
        pastRes.setActualCheckIn(yesterdayStart);
        pastRes.setActualCheckOut(yesterdayEnd);
        pastRes.setFinalAmount(new BigDecimal("75.00"));
        pastRes = reservationRepository.save(pastRes);

        ParkingSession pastSession = new ParkingSession(pastRes, yesterdayStart, new BigDecimal("25.00"));
        pastSession.setCheckOutTime(yesterdayEnd);
        pastSession.setDurationMinutes(180L);
        pastSession.setTotalAmount(new BigDecimal("75.00"));
        pastSession.setPaymentStatus(PaymentStatus.PAID);
        sessionRepository.save(pastSession);

        Payment pastPayment = new Payment(
                pastRes,
                new BigDecimal("75.00"),
                "CREDIT_CARD",
                PaymentStatus.PAID,
                "TXN-DEMO789412",
                yesterdayEnd
        );
        paymentRepository.save(pastPayment);

        // 7. Create Active Ongoing Reservation & Session (Slot A-102 Occupied)
        LocalDateTime activeStart = LocalDateTime.now().minusHours(1).minusMinutes(25);
        LocalDateTime activeEnd = LocalDateTime.now().plusHours(2);
        Reservation activeRes = new Reservation(
                "SPK-ACT982",
                customer1,
                v1,
                loc1Slots.get(1), // A-102
                activeStart,
                activeEnd,
                ReservationStatus.ACTIVE,
                new BigDecimal("75.00")
        );
        activeRes.setActualCheckIn(activeStart);
        activeRes = reservationRepository.save(activeRes);

        ParkingSession activeSession = new ParkingSession(activeRes, activeStart, new BigDecimal("25.00"));
        activeSession.setPaymentStatus(PaymentStatus.PENDING);
        sessionRepository.save(activeSession);

        // 8. Create Upcoming Confirmed Reservation (Slot A-105 Reserved)
        LocalDateTime futureStart = LocalDateTime.now().plusHours(1);
        LocalDateTime futureEnd = LocalDateTime.now().plusHours(3);
        Reservation futureRes = new Reservation(
                "SPK-RES331",
                customer2,
                v3,
                loc1Slots.get(4), // A-105
                futureStart,
                futureEnd,
                ReservationStatus.CONFIRMED,
                new BigDecimal("30.00")
        );
        reservationRepository.save(futureRes);

        // 9. Create Notifications
        notificationRepository.save(new Notification(
                customer1,
                "Active Parking Session",
                "Your vehicle CA-8899-TX is currently parked in Slot A-102 at Downtown Grand Center.",
                NotificationType.INFO
        ));

        notificationRepository.save(new Notification(
                customer2,
                "Upcoming Reservation Reminder",
                "You have a confirmed reservation for slot A-105 starting in 1 hour.",
                NotificationType.SUCCESS
        ));

        // 10. Audit Log
        auditLogRepository.save(new AuditLog(
                admin,
                "SYSTEM_BOOTSTRAP",
                "System",
                1L,
                "Initial demo data seeded with 2 locations, 20 slots, 3 vehicles, and sample bookings."
        ));

        logger.info("Demo data seeding completed successfully!");
    }
}
