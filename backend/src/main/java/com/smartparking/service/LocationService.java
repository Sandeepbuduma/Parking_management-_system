package com.smartparking.service;

import com.smartparking.dto.LocationRequest;
import com.smartparking.dto.LocationResponse;
import com.smartparking.entity.ParkingLocation;
import com.smartparking.entity.User;
import com.smartparking.entity.enums.SlotStatus;
import com.smartparking.exception.BadRequestException;
import com.smartparking.exception.ResourceNotFoundException;
import com.smartparking.mapper.DtoMapper;
import com.smartparking.repository.ParkingLocationRepository;
import com.smartparking.repository.ParkingSlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationService {

    private final ParkingLocationRepository locationRepository;
    private final ParkingSlotRepository slotRepository;
    private final AuditLogService auditLogService;

    public LocationService(ParkingLocationRepository locationRepository,
                           ParkingSlotRepository slotRepository,
                           AuditLogService auditLogService) {
        this.locationRepository = locationRepository;
        this.slotRepository = slotRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<LocationResponse> getActiveLocations() {
        return locationRepository.findByActiveTrue()
                .stream()
                .map(this::mapWithSlotCounts)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LocationResponse> getAllLocations() {
        return locationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapWithSlotCounts)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LocationResponse getLocationById(Long id) {
        ParkingLocation loc = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));
        return mapWithSlotCounts(loc);
    }

    @Transactional
    public LocationResponse createLocation(LocationRequest request, User adminUser) {
        ParkingLocation loc = new ParkingLocation();
        loc.setName(request.getName().trim());
        loc.setAddress(request.getAddress().trim());
        loc.setDescription(request.getDescription());
        loc.setTotalFloors(request.getTotalFloors());
        loc.setOpeningTime(request.getOpeningTime() != null ? request.getOpeningTime() : "00:00");
        loc.setClosingTime(request.getClosingTime() != null ? request.getClosingTime() : "23:59");
        loc.setActive(request.getActive() != null ? request.getActive() : true);

        ParkingLocation saved = locationRepository.save(loc);
        auditLogService.record(adminUser, "CREATE_LOCATION", "ParkingLocation", saved.getId(),
                "Created parking location: " + saved.getName());

        return mapWithSlotCounts(saved);
    }

    @Transactional
    public LocationResponse updateLocation(Long id, LocationRequest request, User adminUser) {
        ParkingLocation loc = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));

        loc.setName(request.getName().trim());
        loc.setAddress(request.getAddress().trim());
        loc.setDescription(request.getDescription());
        loc.setTotalFloors(request.getTotalFloors());
        if (request.getOpeningTime() != null) loc.setOpeningTime(request.getOpeningTime());
        if (request.getClosingTime() != null) loc.setClosingTime(request.getClosingTime());
        if (request.getActive() != null) loc.setActive(request.getActive());

        ParkingLocation saved = locationRepository.save(loc);
        auditLogService.record(adminUser, "UPDATE_LOCATION", "ParkingLocation", saved.getId(),
                "Updated parking location: " + saved.getName());

        return mapWithSlotCounts(saved);
    }

    @Transactional
    public void deleteLocation(Long id, User adminUser) {
        ParkingLocation loc = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));

        long slotCount = slotRepository.findByLocationId(id).size();
        if (slotCount > 0) {
            // Soft delete/deactivate if it contains slots
            loc.setActive(false);
            locationRepository.save(loc);
            auditLogService.record(adminUser, "DEACTIVATE_LOCATION", "ParkingLocation", loc.getId(),
                    "Deactivated location with " + slotCount + " slots: " + loc.getName());
        } else {
            locationRepository.delete(loc);
            auditLogService.record(adminUser, "DELETE_LOCATION", "ParkingLocation", id,
                    "Deleted parking location: " + loc.getName());
        }
    }

    private LocationResponse mapWithSlotCounts(ParkingLocation loc) {
        var slots = slotRepository.findByLocationId(loc.getId());
        long total = slots.size();
        long available = slots.stream().filter(s -> s.getStatus() == SlotStatus.AVAILABLE).count();
        return DtoMapper.toLocationResponse(loc, total, available);
    }
}
