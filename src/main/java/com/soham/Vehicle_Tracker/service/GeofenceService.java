package com.soham.Vehicle_Tracker.service;
import com.soham.Vehicle_Tracker.controller.dto.GeofenceRequest;
import com.soham.Vehicle_Tracker.controller.dto.GeofenceResponse;
import com.soham.Vehicle_Tracker.entity.GeofenceStatus;
import com.soham.Vehicle_Tracker.entity.Vehicle;
import com.soham.Vehicle_Tracker.repository.GeofenceRepository;
import com.soham.Vehicle_Tracker.repository.GeofenceStatusRepository;

import java.util.ArrayList;
import java.util.Optional;
import com.soham.Vehicle_Tracker.entity.Geofence;
import com.soham.Vehicle_Tracker.entity.GeofencePoint;
import com.soham.Vehicle_Tracker.repository.GeofencePointRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
public class GeofenceService {
    @Autowired
    private GeofenceStatusRepository geofenceStatusRepository;
    @Autowired
    private GeofenceRepository geofenceRepository;

    public void checkAllGeofencesForVehicle(Vehicle vehicle, double lat, double lon) {
        List<Geofence> activeGeofences = geofenceRepository.findByActiveTrue();

        for (Geofence geofence : activeGeofences) {
            checkGeofenceTransition(vehicle, geofence, lat, lon);
        }
    }

    @Autowired
    private GeofencePointRepository geofencePointRepository;

    private boolean isInsidePolygon(double lat, double lon, List<GeofencePoint> polygon) {
        int n = polygon.size();
        boolean inside = false;

        for (int i = 0, j = n - 1; i < n; j = i++) {
            double lat_i = polygon.get(i).getLatitude();
            double lon_i = polygon.get(i).getLongitude();
            double lat_j = polygon.get(j).getLatitude();
            double lon_j = polygon.get(j).getLongitude();

            boolean straddles = (lat_i > lat) != (lat_j > lat);

            if (straddles) {
                double crossingLon = lon_i + (lat - lat_i) / (lat_j - lat_i) * (lon_j - lon_i);

                if (lon < crossingLon) {
                    inside = !inside;
                }
            }
        }

        return inside;
    }

    public boolean isVehicleInsideGeofence(double lat, double lon, Geofence geofence) {
        List<GeofencePoint> points = geofencePointRepository
                .findByGeofenceIdOrderBySequenceIndexAsc(geofence.getId());

        return isInsidePolygon(lat, lon, points);
    }
    public void checkGeofenceTransition(Vehicle vehicle, Geofence geofence, double lat, double lon) {
        boolean currentlyInside = isVehicleInsideGeofence(lat, lon, geofence);

        Optional<GeofenceStatus> existingStatus = geofenceStatusRepository
                .findByVehicleIdAndGeofenceId(vehicle.getId(), geofence.getId());

        if (existingStatus.isEmpty()) {
            // First-ever check for this pair — just establish the baseline, no alert
            GeofenceStatus newStatus = new GeofenceStatus();
            newStatus.setVehicle(vehicle);
            newStatus.setGeofence(geofence);
            newStatus.setWasInside(currentlyInside);
            geofenceStatusRepository.save(newStatus);

        } else {
            GeofenceStatus status = existingStatus.get();
            boolean previouslyInside = status.isWasInside();

            if (previouslyInside != currentlyInside) {
                // A transition happened — crossed the boundary
                if (currentlyInside) {
                    System.out.println("ALERT: Vehicle " + vehicle.getId() + " entered geofence " + geofence.getName());
                } else {
                    System.out.println("ALERT: Vehicle " + vehicle.getId() + " exited geofence " + geofence.getName());
                }
            }

            // Update status either way, so next check has an accurate baseline
            status.setWasInside(currentlyInside);
            geofenceStatusRepository.save(status);
        }
    }
    public Geofence createGeofence(GeofenceRequest request) {
        Geofence geofence = new Geofence();
        geofence.setName(request.getName());
        Geofence savedGeofence = geofenceRepository.save(geofence);

        List<GeofencePoint> points = new ArrayList<>();
        List<GeofenceRequest.PointDTO> dtoPoints = request.getPoints();

        for (int i = 0; i < dtoPoints.size(); i++) {
            GeofenceRequest.PointDTO dto = dtoPoints.get(i);
            GeofencePoint point = new GeofencePoint();
            point.setGeofence(savedGeofence);
            point.setLatitude(dto.getLatitude());
            point.setLongitude(dto.getLongitude());
            point.setSequenceIndex(i);
            points.add(point);
        }

        geofencePointRepository.saveAll(points);
        return savedGeofence;
    }
    public GeofenceResponse getGeofenceWithPoints(Long geofenceId) {
        Geofence geofence = geofenceRepository.findById(geofenceId)
                .orElseThrow(() -> new RuntimeException("Geofence not found: " + geofenceId));

        List<GeofencePoint> points = geofencePointRepository
                .findByGeofenceIdOrderBySequenceIndexAsc(geofenceId);

        GeofenceResponse response = new GeofenceResponse();
        response.setId(geofence.getId());
        response.setName(geofence.getName());
        response.setActive(geofence.isActive());

        List<GeofenceResponse.PointDTO> pointDTOs = new ArrayList<>();
        for (GeofencePoint point : points) {
            GeofenceResponse.PointDTO dto = new GeofenceResponse.PointDTO();
            dto.setLatitude(point.getLatitude());
            dto.setLongitude(point.getLongitude());
            pointDTOs.add(dto);
        }
        response.setPoints(pointDTOs);

        return response;
    }
}