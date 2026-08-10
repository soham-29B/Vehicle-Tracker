package com.soham.Vehicle_Tracker.service;

import com.soham.Vehicle_Tracker.repository.VehicleRepository;
import com.soham.Vehicle_Tracker.repository.RoutePointRepository;
import com.soham.Vehicle_Tracker.entity.Vehicle;
import com.soham.Vehicle_Tracker.entity.RoutePoint;
import com.soham.Vehicle_Tracker.util.GeoUtils;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.Random;

@Service
public class GpsSimulatorService {

    private static final double OVERSPEED_THRESHOLD_KMH = 80.0;

    private final VehicleRepository vehicleRepository;
    private final RoutePointRepository routePointRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final GeofenceService geofenceService;
    private final Random random = new Random();

    public GpsSimulatorService(VehicleRepository vehicleRepository,
                               RoutePointRepository routePointRepository,
                               SimpMessagingTemplate messagingTemplate,
                               GeofenceService geofenceService) {
        this.vehicleRepository = vehicleRepository;
        this.routePointRepository = routePointRepository;
        this.messagingTemplate = messagingTemplate;
        this.geofenceService = geofenceService;
    }

    @Scheduled(fixedRate = 3000)
    public void simulateMovement() {
        List<Vehicle> vehicles = vehicleRepository.findAll();

        for (Vehicle vehicle : vehicles) {
            double oldLat = vehicle.getLatitude() != null ? vehicle.getLatitude() : 20.2961;
            double oldLng = vehicle.getLongitude() != null ? vehicle.getLongitude() : 85.8245;
            Instant oldTimestamp = vehicle.getLastUpdated();

            double newLat = oldLat + (random.nextDouble() - 0.5) * 0.001;
            double newLng = oldLng + (random.nextDouble() - 0.5) * 0.001;
            Instant newTimestamp = Instant.now();

            vehicle.setLatitude(newLat);
            vehicle.setLongitude(newLng);
            vehicle.setLastUpdated(newTimestamp);

            RoutePoint point = new RoutePoint(vehicle, newLat, newLng, newTimestamp);
            routePointRepository.save(point);

            geofenceService.checkAllGeofencesForVehicle(vehicle, newLat, newLng);

            if (oldTimestamp != null) {
                double distanceKm = GeoUtils.calculateDistanceKm(oldLat, oldLng, newLat, newLng);
                double hoursElapsed = java.time.Duration.between(oldTimestamp, newTimestamp).toMillis() / 3600000.0;
                double speedKmh = hoursElapsed > 0 ? distanceKm / hoursElapsed : 0;

                boolean currentlyOverspeeding = speedKmh > OVERSPEED_THRESHOLD_KMH;

                if (currentlyOverspeeding && !vehicle.isWasOverspeeding()) {
                    System.out.println("ALERT: Vehicle " + vehicle.getId() + " started overspeeding at "
                            + String.format("%.1f", speedKmh) + " km/h");
                } else if (!currentlyOverspeeding && vehicle.isWasOverspeeding()) {
                    System.out.println("Vehicle " + vehicle.getId() + " back to normal speed");
                }

                vehicle.setWasOverspeeding(currentlyOverspeeding);
            }

            vehicleRepository.save(vehicle);

            messagingTemplate.convertAndSend("/topic/vehicles", vehicle);
        }
    }
}