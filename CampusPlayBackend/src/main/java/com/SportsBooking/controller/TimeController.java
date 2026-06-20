package com.SportsBooking.controller;

import com.SportsBooking.model.TimeSlot;
import com.SportsBooking.repo.SportRepo;
import com.SportsBooking.repo.TimeSlotRepo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/slots")
@CrossOrigin
public class TimeController {
    private final TimeSlotRepo timeSlotRepo;
    private final SportRepo sportRepo;

    public TimeController(TimeSlotRepo timeSlotRepo,SportRepo sportRepo) {
        this.timeSlotRepo = timeSlotRepo;
        this.sportRepo=sportRepo;

    }

    @PostMapping
    public ResponseEntity<TimeSlot> addSlot(@RequestBody TimeSlot timeSlot,@RequestParam Long sportId)
    {
        return  new ResponseEntity<>(timeSlotRepo.save(timeSlot), HttpStatus.OK);

    }
    @GetMapping("/sport/{sportId}")
    public ResponseEntity<List<TimeSlot>> getSlotsBySport(@PathVariable Long sportId) {
        List<TimeSlot> filteredSlots = timeSlotRepo.findAll().stream()
                .filter(TimeSlot::isActive).toList();
        return ResponseEntity.ok(filteredSlots);
    }

}
