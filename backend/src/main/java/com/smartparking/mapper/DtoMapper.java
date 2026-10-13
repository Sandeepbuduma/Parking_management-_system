package com.smartparking.mapper;

import com.smartparking.dto.*;
import com.smartparking.entity.*;

public class DtoMapper {

    public static UserResponse toUserResponse(User user) {
        if (user == null) return null;
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.isEnabled(),
                user.getCreatedAt()
        );
    }

    public static LocationResponse toLocationResponse(ParkingLocation loc, long totalSlots, long availableSlots) {
        if (loc == null) return null;
        LocationResponse resp = new LocationResponse();
        resp.setId(loc.getId());
        resp.setName(loc.getName());
        resp.setAddress(loc.getAddress());
        resp.setDescription(loc.getDescription());
        resp.setTotalFloors(loc.getTotalFloors());
        resp.setOpeningTime(loc.getOpeningTime());
        resp.setClosingTime(loc.getClosingTime());
        resp.setActive(loc.isActive());
        resp.setTotalSlots(totalSlots);
        resp.setAvailableSlots(availableSlots);
        resp.setCreatedAt(loc.getCreatedAt());
        return resp;
    }

    public static SlotResponse toSlotResponse(ParkingSlot slot) {
        if (slot == null) return null;
        SlotResponse resp = new SlotResponse();
        resp.setId(slot.getId());
        resp.setLocationId(slot.getLocation().getId());
        resp.setLocationName(slot.getLocation().getName());
        resp.setSlotNumber(slot.getSlotNumber());
        resp.setFloorNumber(slot.getFloorNumber());
        resp.setVehicleType(slot.getVehicleType());
        resp.setHourlyRate(slot.getHourlyRate());
        resp.setStatus(slot.getStatus());
        resp.setCreatedAt(slot.getCreatedAt());
        return resp;
    }

    public static VehicleResponse toVehicleResponse(Vehicle vehicle) {
        if (vehicle == null) return null;
        VehicleResponse resp = new VehicleResponse();
        resp.setId(vehicle.getId());
        resp.setUserId(vehicle.getUser().getId());
        resp.setUserFullName(vehicle.getUser().getFullName());
        resp.setRegistrationNumber(vehicle.getRegistrationNumber());
        resp.setVehicleType(vehicle.getVehicleType());
        resp.setMake(vehicle.getMake());
        resp.setModel(vehicle.getModel());
        resp.setColor(vehicle.getColor());
        resp.setCreatedAt(vehicle.getCreatedAt());
        return resp;
    }

    public static ReservationResponse toReservationResponse(Reservation res) {
        if (res == null) return null;
        ReservationResponse resp = new ReservationResponse();
        resp.setId(res.getId());
        resp.setBookingReference(res.getBookingReference());
        resp.setUserId(res.getUser().getId());
        resp.setUserFullName(res.getUser().getFullName());
        resp.setUserEmail(res.getUser().getEmail());
        resp.setVehicleId(res.getVehicle().getId());
        resp.setVehicleRegistration(res.getVehicle().getRegistrationNumber());
        resp.setVehicleType(res.getVehicle().getVehicleType());
        resp.setSlotId(res.getSlot().getId());
        resp.setSlotNumber(res.getSlot().getSlotNumber());
        resp.setFloorNumber(res.getSlot().getFloorNumber());
        resp.setLocationId(res.getSlot().getLocation().getId());
        resp.setLocationName(res.getSlot().getLocation().getName());
        resp.setStartTime(res.getStartTime());
        resp.setEndTime(res.getEndTime());
        resp.setActualCheckIn(res.getActualCheckIn());
        resp.setActualCheckOut(res.getActualCheckOut());
        resp.setStatus(res.getStatus());
        resp.setEstimatedAmount(res.getEstimatedAmount());
        resp.setFinalAmount(res.getFinalAmount());
        resp.setCreatedAt(res.getCreatedAt());
        return resp;
    }

    public static SessionResponse toSessionResponse(ParkingSession session) {
        if (session == null) return null;
        SessionResponse resp = new SessionResponse();
        resp.setId(session.getId());
        resp.setReservationId(session.getReservation().getId());
        resp.setBookingReference(session.getReservation().getBookingReference());
        resp.setCustomerName(session.getReservation().getUser().getFullName());
        resp.setCustomerEmail(session.getReservation().getUser().getEmail());
        resp.setSlotNumber(session.getReservation().getSlot().getSlotNumber());
        resp.setLocationName(session.getReservation().getSlot().getLocation().getName());
        resp.setVehicleRegistration(session.getReservation().getVehicle().getRegistrationNumber());
        resp.setCheckInTime(session.getCheckInTime());
        resp.setCheckOutTime(session.getCheckOutTime());
        resp.setDurationMinutes(session.getDurationMinutes());
        resp.setHourlyRate(session.getHourlyRate());
        resp.setTotalAmount(session.getTotalAmount());
        resp.setPaymentStatus(session.getPaymentStatus());
        resp.setCreatedAt(session.getCreatedAt());
        return resp;
    }

    public static PaymentResponse toPaymentResponse(Payment payment) {
        if (payment == null) return null;
        PaymentResponse resp = new PaymentResponse();
        resp.setId(payment.getId());
        resp.setReservationId(payment.getReservation().getId());
        resp.setBookingReference(payment.getReservation().getBookingReference());
        resp.setCustomerName(payment.getReservation().getUser().getFullName());
        resp.setAmount(payment.getAmount());
        resp.setPaymentMethod(payment.getPaymentMethod());
        resp.setPaymentStatus(payment.getPaymentStatus());
        resp.setTransactionReference(payment.getTransactionReference());
        resp.setPaidAt(payment.getPaidAt());
        resp.setCreatedAt(payment.getCreatedAt());
        return resp;
    }

    public static NotificationResponse toNotificationResponse(Notification notif) {
        if (notif == null) return null;
        NotificationResponse resp = new NotificationResponse();
        resp.setId(notif.getId());
        resp.setTitle(notif.getTitle());
        resp.setMessage(notif.getMessage());
        resp.setNotificationType(notif.getNotificationType());
        resp.setRead(notif.isRead());
        resp.setCreatedAt(notif.getCreatedAt());
        return resp;
    }
}
