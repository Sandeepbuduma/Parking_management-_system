package com.smartparking.service;

import com.smartparking.dto.VehicleRequest;
import com.smartparking.dto.VehicleResponse;
import com.smartparking.entity.User;
import com.smartparking.entity.Vehicle;
import com.smartparking.exception.BadRequestException;
import com.smartparking.exception.ConflictException;
import com.smartparking.exception.ForbiddenException;
import com.smartparking.exception.ResourceNotFoundException;
import com.smartparking.mapper.DtoMapper;
import com.smartparking.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> getVehiclesByUserId(Long userId) {
        return vehicleRepository.findByUserId(userId)
                .stream()
                .map(DtoMapper::toVehicleResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> getAllVehicles() {
        return vehicleRepository.findAll()
                .stream()
                .map(DtoMapper::toVehicleResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Vehicle getVehicleEntity(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
    }

    @Transactional
    public VehicleResponse addVehicle(User user, VehicleRequest request) {
        String regNumber = request.getRegistrationNumber().trim().toUpperCase();
        if (vehicleRepository.existsByRegistrationNumber(regNumber)) {
            throw new ConflictException("Vehicle with registration number " + regNumber + " is already registered");
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setUser(user);
        vehicle.setRegistrationNumber(regNumber);
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setMake(request.getMake() != null ? request.getMake().trim() : null);
        vehicle.setModel(request.getModel() != null ? request.getModel().trim() : null);
        vehicle.setColor(request.getColor() != null ? request.getColor().trim() : null);

        Vehicle saved = vehicleRepository.save(vehicle);
        return DtoMapper.toVehicleResponse(saved);
    }

    @Transactional
    public VehicleResponse updateVehicle(Long id, User user, VehicleRequest request) {
        Vehicle vehicle = getVehicleEntity(id);

        if (!vehicle.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You cannot edit a vehicle that does not belong to you");
        }

        String regNumber = request.getRegistrationNumber().trim().toUpperCase();
        if (vehicleRepository.existsByRegistrationNumberAndIdNot(regNumber, id)) {
            throw new ConflictException("Vehicle with registration number " + regNumber + " is already registered");
        }

        vehicle.setRegistrationNumber(regNumber);
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setMake(request.getMake() != null ? request.getMake().trim() : null);
        vehicle.setModel(request.getModel() != null ? request.getModel().trim() : null);
        vehicle.setColor(request.getColor() != null ? request.getColor().trim() : null);

        Vehicle saved = vehicleRepository.save(vehicle);
        return DtoMapper.toVehicleResponse(saved);
    }

    @Transactional
    public void deleteVehicle(Long id, User user) {
        Vehicle vehicle = getVehicleEntity(id);

        if (!vehicle.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You cannot delete a vehicle that does not belong to you");
        }

        try {
            vehicleRepository.delete(vehicle);
        } catch (Exception ex) {
            throw new BadRequestException("Cannot delete vehicle because it is associated with existing parking reservations");
        }
    }
}
