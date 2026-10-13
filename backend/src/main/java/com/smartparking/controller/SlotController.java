package com.smartparking.controller;

import com.smartparking.dto.SlotResponse;
import com.smartparking.entity.enums.SlotStatus;
import com.smartparking.entity.enums.VehicleType;
import com.smartparking.service.SlotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/slots")
public class SlotController {

    private final SlotService slotService;

    public SlotController(SlotService slotService) {
        this.slotService = slotService;
    }

    @GetMapping("/available")
    public ResponseEntity<List<SlotResponse>> getAvailableSlots(
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) VehicleType vehicleType) {
        return ResponseEntity.ok(slotService.getAvailableSlots(locationId, vehicleType));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SlotResponse> getSlotById(@PathVariable Long id) {
        return ResponseEntity.ok(slotService.getSlotById(id));
    }

    @GetMapping
    public ResponseEntity<List<SlotResponse>> getAllSlotsWithFilters(
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) SlotStatus status,
            @RequestParam(required = false) VehicleType vehicleType,
            @RequestParam(required = false) Integer floorNumber) {
        return ResponseEntity.ok(slotService.getAllSlotsWithFilters(locationId, status, vehicleType, floorNumber));
    }
}
