package com.soham.Vehicle_Tracker.controller.dto;

import lombok.Data;
import java.util.List;

@Data
public class GeofenceResponse {
    private Long id;
    private String name;
    private boolean active;
    private List<PointDTO> points;

    @Data
    public static class PointDTO {
        private double latitude;
        private double longitude;
    }
}