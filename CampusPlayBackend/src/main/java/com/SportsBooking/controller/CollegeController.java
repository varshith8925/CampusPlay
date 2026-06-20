package com.SportsBooking.controller;

import com.SportsBooking.model.College;
import com.SportsBooking.repo.CollegeRepo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/colleges")
@CrossOrigin
public class CollegeController {
    private final CollegeRepo collegeRepo;

    public CollegeController(CollegeRepo collegeRepo) {
        this.collegeRepo = collegeRepo;
    }
    @GetMapping
    public ResponseEntity<List<College>> getAllColleges()
    {
        return new ResponseEntity<>(collegeRepo.findAll(), HttpStatus.OK);
    }
    @PostMapping
    public ResponseEntity<College> createCollege(@RequestBody College college)
    {
        return new ResponseEntity<>(collegeRepo.save(college),HttpStatus.CREATED);
    }
}
