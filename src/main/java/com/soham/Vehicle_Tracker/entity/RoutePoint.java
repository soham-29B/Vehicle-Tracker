package com.soham.Vehicle_Tracker.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "route_points")
public class RoutePoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    private double latitude;
    private double longitude;
    private Instant timestamp;

    public RoutePoint() {}

    public RoutePoint(Vehicle vehicle, double latitude, double longitude, Instant timestamp) {
        this.vehicle = vehicle;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timestamp = timestamp;
    }

    // Getters
    public Long getId() { return id; }
    public Vehicle getVehicle() { return vehicle; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public Instant getTimestamp() { return timestamp; }
}