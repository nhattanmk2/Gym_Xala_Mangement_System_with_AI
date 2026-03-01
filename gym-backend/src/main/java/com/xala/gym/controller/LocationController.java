package com.xala.gym.controller;

import com.xala.gym.entity.GymLocation;
import com.xala.gym.repository.GymLocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final GymLocationRepository gymLocationRepository;

    @GetMapping
    public ResponseEntity<List<GymLocation>> getAllLocations() {
        return ResponseEntity.ok(gymLocationRepository.findAll());
    }
}
