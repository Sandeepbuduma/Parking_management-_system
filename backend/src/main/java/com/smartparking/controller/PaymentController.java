package com.smartparking.controller;

import com.smartparking.dto.PaymentRequest;
import com.smartparking.dto.PaymentResponse;
import com.smartparking.entity.User;
import com.smartparking.service.AuthService;
import com.smartparking.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final AuthService authService;

    public PaymentController(PaymentService paymentService, AuthService authService) {
        this.paymentService = paymentService;
        this.authService = authService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<PaymentResponse>> getMyPayments(@AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(paymentService.getUserPayments(user.getId()));
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> recordPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PaymentRequest request) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        return new ResponseEntity<>(paymentService.recordPayment(request, user), HttpStatus.CREATED);
    }
}
