package com.smartparking.repository;

import com.smartparking.entity.ParkingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingSessionRepository extends JpaRepository<ParkingSession, Long> {

    Optional<ParkingSession> findByReservationId(Long reservationId);

    List<ParkingSession> findByCheckOutTimeIsNullOrderByCheckInTimeDesc();

    List<ParkingSession> findAllByOrderByCheckInTimeDesc();

    @Query("SELECT s FROM ParkingSession s WHERE s.reservation.user.id = :userId ORDER BY s.checkInTime DESC")
    List<ParkingSession> findByUserId(Long userId);

    long countByCheckOutTimeIsNull();
}
