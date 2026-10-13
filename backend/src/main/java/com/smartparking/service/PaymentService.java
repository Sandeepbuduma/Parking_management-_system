package com.smartparking.service;

import com.smartparking.dto.PaymentRequest;
import com.smartparking.dto.PaymentResponse;
import com.smartparking.entity.Payment;
import com.smartparking.entity.Reservation;
import com.smartparking.entity.User;
import com.smartparking.entity.enums.PaymentStatus;
import com.smartparking.exception.BadRequestException;
import com.smartparking.exception.ResourceNotFoundException;
import com.smartparking.mapper.DtoMapper;
import com.smartparking.repository.PaymentRepository;
import com.smartparking.repository.ReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;

    public PaymentService(PaymentRepository paymentRepository, ReservationRepository reservationRepository) {
        this.paymentRepository = paymentRepository;
        this.reservationRepository = reservationRepository;
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getUserPayments(Long userId) {
        return paymentRepository.findByUserId(userId)
                .stream()
                .map(DtoMapper::toPaymentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(DtoMapper::toPaymentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponse recordPayment(PaymentRequest request, User currentUser) {
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + request.getReservationId()));

        String txnRef = "TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
        Payment payment = new Payment(
                reservation,
                request.getAmount(),
                request.getPaymentMethod(),
                PaymentStatus.PAID,
                txnRef,
                LocalDateTime.now()
        );

        Payment saved = paymentRepository.save(payment);
        return DtoMapper.toPaymentResponse(saved);
    }
}
