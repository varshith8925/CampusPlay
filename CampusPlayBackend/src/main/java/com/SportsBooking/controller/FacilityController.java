package com.SportsBooking.controller;


import com.SportsBooking.model.Facility;
import com.SportsBooking.service.FacilityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/facilities")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @PostMapping
    public ResponseEntity<Facility> addFacility(@RequestBody Facility facility, @RequestParam Long sportId) {
        return new ResponseEntity<>(facilityService.addFacility(facility, sportId), HttpStatus.CREATED);
    }

    @GetMapping("/sport/{sportId}")
    public ResponseEntity<List<Facility>> getFacilitiesBySport(@PathVariable Long sportId) {
        return ResponseEntity.ok(facilityService.getFacilitiesBySport(sportId));
    }
}