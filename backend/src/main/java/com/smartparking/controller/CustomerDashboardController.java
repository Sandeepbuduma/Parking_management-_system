package com.smartparking.controller;

import com.smartparking.dto.CustomerDashboardStats;
import com.smartparking.entity.User;
import com.smartparking.service.AuthService;
import com.smartparking.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class CustomerDashboardController {

    private final DashboardService dashboardService;
    private final AuthService authService;

    public CustomerDashboardController(DashboardService dashboardService, AuthService authService) {
        this.dashboardService = dashboardService;
        this.authService = authService;
    }

    @GetMapping("/customer")
    public ResponseEntity<CustomerDashboardStats> getCustomerDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(dashboardService.getCustomerStats(user.getId()));
    }
}
