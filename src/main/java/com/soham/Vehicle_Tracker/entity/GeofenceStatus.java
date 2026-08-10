package com.soham.Vehicle_Tracker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "geofence_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeofenceStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "geofence_id")
    private Geofence geofence;

    private boolean wasInside;
}