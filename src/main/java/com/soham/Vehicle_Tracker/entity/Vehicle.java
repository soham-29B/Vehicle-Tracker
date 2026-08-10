package com.soham.Vehicle_Tracker.entity;
import jakarta.persistence.*;
@Entity
@Table(name = "vehicles")
    public class Vehicle {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String licensePlate;
        private String driverName;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getLicensePlate() { return licensePlate; }
        public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

        public String getDriverName() { return driverName; }
        public void setDriverName(String driverName) { this.driverName = driverName; }
    private Double latitude;
    private Double longitude;
    private java.time.Instant lastUpdated;

    // Add these getters/setters too:
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }



    public java.time.Instant getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(java.time.Instant lastUpdated) { this.lastUpdated = lastUpdated; }
    private boolean wasOverspeeding = false;
    public boolean isWasOverspeeding() {
        return wasOverspeeding;
    }

    public void setWasOverspeeding(boolean wasOverspeeding) {
        this.wasOverspeeding = wasOverspeeding;
    }
    }

