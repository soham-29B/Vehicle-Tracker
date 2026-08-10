package com.soham.Vehicle_Tracker.repository;

import com.soham.Vehicle_Tracker.entity.GeofenceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GeofenceStatusRepository extends JpaRepository<GeofenceStatus, Long> {

    Optional<GeofenceStatus> findByVehicleIdAndGeofenceId(Long vehicleId, Long geofenceId);

}