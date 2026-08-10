package com.soham.Vehicle_Tracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;  // add this

@SpringBootApplication
@EnableScheduling  // add this
public class VehicleTrackerApplication {
	public static void main(String[] args) {
		SpringApplication.run(VehicleTrackerApplication.class, args);
	}
}
