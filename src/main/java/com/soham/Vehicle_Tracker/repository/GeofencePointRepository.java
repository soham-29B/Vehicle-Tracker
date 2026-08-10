package com.soham.Vehicle_Tracker.repository;

import com.soham.Vehicle_Tracker.entity.GeofencePoint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GeofencePointRepository extends JpaRepository<GeofencePoint, Long> {

    List<GeofencePoint> findByGeofenceIdOrderBySequenceIndexAsc(Long geofenceId);

}