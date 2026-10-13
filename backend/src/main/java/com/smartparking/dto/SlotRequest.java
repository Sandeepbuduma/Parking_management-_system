package com.smartparking.dto;

import com.smartparking.entity.enums.SlotStatus;
import com.smartparking.entity.enums.VehicleType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class SlotRequest {
    @NotNull(message = "Location ID is required")
    private Long locationId;

    @NotBlank(message = "Slot number is required")
    @Size(max = 50, message = "Slot number cannot exceed 50 characters")
    private String slotNumber;

    @NotNull(message = "Floor number is required")
    private Integer floorNumber;

    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;

    @NotNull(message = "Hourly rate is required")
    @DecimalMin(value = "0.00", message = "Hourly rate cannot be negative")
    private BigDecimal hourlyRate;

    private SlotStatus status = SlotStatus.AVAILABLE;

    public SlotRequest() {}

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public Integer getFloorNumber() {
        return floorNumber;
    }

    public void setFloorNumber(Integer floorNumber) {
        this.floorNumber = floorNumber;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(VehicleType vehicleType) {
        this.vehicleType = vehicleType;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public SlotStatus getStatus() {
        return status;
    }

    public void setStatus(SlotStatus status) {
        this.status = status;
    }
}
