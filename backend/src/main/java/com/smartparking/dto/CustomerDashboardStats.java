package com.smartparking.dto;

import java.math.BigDecimal;

public class CustomerDashboardStats {
    private long totalReservations;
    private long activeReservations;
    private long completedReservations;
    private long totalVehicles;
    private BigDecimal totalSpent;
    private long unreadNotifications;

    public CustomerDashboardStats() {}

    public long getTotalReservations() {
        return totalReservations;
    }

    public void setTotalReservations(long totalReservations) {
        this.totalReservations = totalReservations;
    }

    public long getActiveReservations() {
        return activeReservations;
    }

    public void setActiveReservations(long activeReservations) {
        this.activeReservations = activeReservations;
    }

    public long getCompletedReservations() {
        return completedReservations;
    }

    public void setCompletedReservations(long completedReservations) {
        this.completedReservations = completedReservations;
    }

    public long getTotalVehicles() {
        return totalVehicles;
    }

    public void setTotalVehicles(long totalVehicles) {
        this.totalVehicles = totalVehicles;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(BigDecimal totalSpent) {
        this.totalSpent = totalSpent;
    }

    public long getUnreadNotifications() {
        return unreadNotifications;
    }

    public void setUnreadNotifications(long unreadNotifications) {
        this.unreadNotifications = unreadNotifications;
    }
}
