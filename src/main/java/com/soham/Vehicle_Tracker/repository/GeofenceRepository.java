package com.soham.Vehicle_Tracker.repository;

import com.soham.Vehicle_Tracker.entity.Geofence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GeofenceRepository extends JpaRepository<Geofence, Long> {

    List<Geofence> findByActiveTrue();

}