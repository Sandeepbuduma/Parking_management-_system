package com.smartparking.repository;

import com.smartparking.entity.Payment;
import com.smartparking.entity.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT p FROM Payment p WHERE p.reservation.user.id = :userId ORDER BY p.createdAt DESC")
    List<Payment> findByUserId(Long userId);

    List<Payment> findByReservationId(Long reservationId);

    Optional<Payment> findByTransactionReference(String transactionReference);

    List<Payment> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentStatus = :status")
    BigDecimal sumAmountByStatus(PaymentStatus status);
}
