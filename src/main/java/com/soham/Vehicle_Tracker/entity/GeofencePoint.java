package com.soham.Vehicle_Tracker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "geofence_points")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeofencePoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double latitude;

    private double longitude;

    private int sequenceIndex;

    @ManyToOne
    @JoinColumn(name = "geofence_id")
    private Geofence geofence;
}