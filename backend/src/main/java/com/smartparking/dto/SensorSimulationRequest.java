package com.smartparking.dto;

import jakarta.validation.constraints.NotNull;

public class SensorSimulationRequest {
    @NotNull(message = "Slot ID is required")
    private Long slotId;

    @NotNull(message = "Occupied status is required")
    private Boolean occupied;

    public SensorSimulationRequest() {}

    public SensorSimulationRequest(Long slotId, Boolean occupied) {
        this.slotId = slotId;
        this.occupied = occupied;
    }

    public Long getSlotId() {
        return slotId;
    }

    public void setSlotId(Long slotId) {
        this.slotId = slotId;
    }

    public Boolean getOccupied() {
        return occupied;
    }

    public void setOccupied(Boolean occupied) {
        this.occupied = occupied;
    }
}
