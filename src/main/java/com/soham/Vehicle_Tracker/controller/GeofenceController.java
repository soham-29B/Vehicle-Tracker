package com.soham.Vehicle_Tracker.controller;

import com.soham.Vehicle_Tracker.controller.dto.GeofenceRequest;
import com.soham.Vehicle_Tracker.controller.dto.GeofenceResponse;
import com.soham.Vehicle_Tracker.entity.Geofence;
import com.soham.Vehicle_Tracker.repository.GeofenceRepository;
import com.soham.Vehicle_Tracker.service.GeofenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/geofences")
public class GeofenceController {

    @Autowired
    private GeofenceService geofenceService;

    @Autowired
    private GeofenceRepository geofenceRepository;

    @PostMapping
    public ResponseEntity<Geofence> createGeofence(@RequestBody GeofenceRequest request) {
        Geofence created = geofenceService.createGeofence(request);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Geofence>> getAllGeofences() {
        return ResponseEntity.ok(geofenceRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GeofenceResponse> getGeofenceById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(geofenceService.getGeofenceWithPoints(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGeofence(@PathVariable Long id) {
        if (!geofenceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        geofenceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}