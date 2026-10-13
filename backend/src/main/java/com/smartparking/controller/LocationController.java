package com.smartparking.controller;

import com.smartparking.dto.LocationResponse;
import com.smartparking.dto.SlotResponse;
import com.smartparking.service.LocationService;
import com.smartparking.service.SlotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;
    private final SlotService slotService;

    public LocationController(LocationService locationService, SlotService slotService) {
        this.locationService = locationService;
        this.slotService = slotService;
    }

    @GetMapping
    public ResponseEntity<List<LocationResponse>> getActiveLocations() {
        return ResponseEntity.ok(locationService.getActiveLocations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocationResponse> getLocationById(@PathVariable Long id) {
        return ResponseEntity.ok(locationService.getLocationById(id));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<List<SlotResponse>> getSlotsByLocation(@PathVariable Long id) {
        return ResponseEntity.ok(slotService.getSlotsByLocation(id));
    }
}
