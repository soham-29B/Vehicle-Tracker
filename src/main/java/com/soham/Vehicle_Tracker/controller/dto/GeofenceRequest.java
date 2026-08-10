package com.soham.Vehicle_Tracker.controller.dto;

import lombok.Data;
import java.util.List;

@Data
public class GeofenceRequest {
    private String name;
    private List<PointDTO> points;

    @Data
    public static class PointDTO {
        private double latitude;
        private double longitude;
    }
}