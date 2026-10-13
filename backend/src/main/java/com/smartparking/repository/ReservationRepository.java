package com.smartparking.repository;

import com.smartparking.entity.Reservation;
import com.smartparking.entity.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Reservation> findByBookingReference(String bookingReference);

    List<Reservation> findByStatus(ReservationStatus status);

    long countByStatus(ReservationStatus status);

    @Query("SELECT r FROM Reservation r WHERE r.slot.id = :slotId " +
           "AND r.status IN :statuses " +
           "AND (:excludeReservationId IS NULL OR r.id != :excludeReservationId) " +
           "AND (r.startTime < :endTime AND r.endTime > :startTime)")
    List<Reservation> findOverlappingReservations(
            @Param("slotId") Long slotId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("statuses") Collection<ReservationStatus> statuses,
            @Param("excludeReservationId") Long excludeReservationId
    );

    @Query("SELECT r FROM Reservation r WHERE " +
           "(:userId IS NULL OR r.user.id = :userId) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:slotId IS NULL OR r.slot.id = :slotId) " +
           "ORDER BY r.createdAt DESC")
    List<Reservation> searchReservations(
            @Param("userId") Long userId,
            @Param("status") ReservationStatus status,
            @Param("slotId") Long slotId
    );

    @Query("SELECT COALESCE(SUM(COALESCE(r.finalAmount, r.estimatedAmount)), 0) FROM Reservation r WHERE r.status IN ('COMPLETED', 'ACTIVE')")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.status IN ('CONFIRMED', 'ACTIVE')")
    long countActiveOrConfirmedReservations();
}
