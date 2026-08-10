package com.soham.Vehicle_Tracker.service;

import com.soham.Vehicle_Tracker.entity.RoutePoint;
import com.soham.Vehicle_Tracker.repository.RoutePointRepository;
import com.soham.Vehicle_Tracker.repository.VehicleRepository;
import com.soham.Vehicle_Tracker.entity.Vehicle;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final RoutePointRepository routePointRepository;

    public VehicleService(VehicleRepository vehicleRepository, RoutePointRepository routePointRepository) {
        this.vehicleRepository = vehicleRepository;
        this.routePointRepository = routePointRepository;
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle addVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public Optional<Vehicle> getVehicleById(Long id) {
        return vehicleRepository.findById(id);
    }

    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }

    public Vehicle updateVehicle(Long id, Vehicle updatedVehicle) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        vehicle.setLicensePlate(updatedVehicle.getLicensePlate());
        vehicle.setDriverName(updatedVehicle.getDriverName());
        return vehicleRepository.save(vehicle);
    }

    public List<RoutePoint> getVehicleRoute(Long id) {
        return routePointRepository.findByVehicleIdOrderByTimestampAsc(id);
    }
}

