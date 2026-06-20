package com.SportsBooking.controller;

import com.SportsBooking.model.Sport;
import com.SportsBooking.service.SportsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/sports")
@CrossOrigin
public class SportsController {
    private final SportsService sportService;

    public SportsController(SportsService sportService) {
        this.sportService = sportService;
    }

    @PostMapping
    public ResponseEntity<Sport> createSport(@RequestBody Sport sport, @RequestParam Long collegeId) {
        return new ResponseEntity<>(sportService.createSport(sport, collegeId), HttpStatus.CREATED);
    }

    @GetMapping("/college/{collegeId}")
    public ResponseEntity<List<Sport>> getAllSportsByCollege(@PathVariable Long collegeId) {
        return ResponseEntity.ok(sportService.getAllSportsByCollegeId(collegeId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sport> getSportById(@PathVariable Long id) {
        return ResponseEntity.ok(sportService.getSportById(id));
    }
    @PutMapping("/{id}")
    public ResponseEntity<Sport> updateSport(
            @PathVariable Long id,
            @RequestBody Sport updatedSportDetails) {

        Sport modifiedSport = sportService.updateSportDetails(id, updatedSportDetails);
        return ResponseEntity.ok(modifiedSport);
    }
}
