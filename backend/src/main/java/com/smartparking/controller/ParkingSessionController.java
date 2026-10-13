package com.smartparking.controller;

import com.smartparking.dto.SessionResponse;
import com.smartparking.entity.User;
import com.smartparking.service.AuthService;
import com.smartparking.service.ParkingSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parking-sessions")
public class ParkingSessionController {

    private final ParkingSessionService sessionService;
    private final AuthService authService;

    public ParkingSessionController(ParkingSessionService sessionService, AuthService authService) {
        this.sessionService = sessionService;
        this.authService = authService;
    }

    @PostMapping("/{reservationId}/check-in")
    public ResponseEntity<SessionResponse> checkIn(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reservationId) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(sessionService.checkIn(reservationId, user));
    }

    @PostMapping("/{reservationId}/check-out")
    public ResponseEntity<SessionResponse> checkOut(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reservationId) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(sessionService.checkOut(reservationId, user));
    }

    @GetMapping("/active")
    public ResponseEntity<List<SessionResponse>> getActiveSessions() {
        return ResponseEntity.ok(sessionService.getActiveSessions());
    }

    @GetMapping("/history")
    public ResponseEntity<List<SessionResponse>> getUserSessionHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(sessionService.getUserSessions(user.getId()));
    }
}
