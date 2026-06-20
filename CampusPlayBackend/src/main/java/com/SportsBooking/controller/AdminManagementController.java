package com.SportsBooking.controller;

import com.SportsBooking.model.User;
import com.SportsBooking.repo.UserRepo;
import com.SportsBooking.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner")
@CrossOrigin
public class AdminManagementController {
    private final UserService userService;
    AdminManagementController(UserService userService)
    {
        this.userService=userService;
    }
    @GetMapping("/pendingAdmins")
    public ResponseEntity<List<User>> getPendingAdmins()
    {
        return new ResponseEntity<>(userService.getPendingAdmins(),HttpStatus.OK);
    }
    @PutMapping("/approveAdmin/{id}")
    public ResponseEntity<User> approveAdmin(@PathVariable long id)
    {
        User user=userService.approveAdmin(id);
        return new ResponseEntity<>(user,HttpStatus.OK);
    }
}
