package com.soham.Vehicle_Tracker.repository;

import com.soham.Vehicle_Tracker.entity.RoutePoint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoutePointRepository extends JpaRepository<RoutePoint, Long> {
    List<RoutePoint> findByVehicleIdOrderByTimestampAsc(Long vehicleId);
}
