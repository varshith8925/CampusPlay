package com.SportsBooking.controller;

import com.SportsBooking.dto.LoginRequest;
import com.SportsBooking.model.Role;
import com.SportsBooking.model.User;
import com.SportsBooking.repo.CollegeRepo;
import com.SportsBooking.repo.UserRepo;
import org.springframework.http.HttpRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {
    private final UserRepo userRepo;
    private final CollegeRepo collegeRepo;

    public AuthController(UserRepo userRepo, CollegeRepo collegeRepo) {
        this.userRepo = userRepo;
        this.collegeRepo = collegeRepo;
    }
    @PostMapping("/register")
    public ResponseEntity<Object> register(@RequestBody User user,@RequestParam Long collegeId)
    {
        if(userRepo.findByEmail(user.getEmail()).isPresent())
            return new ResponseEntity<>("User already registered", HttpStatus.BAD_REQUEST);
        if(collegeId!=null)
        {
            collegeRepo.findById(collegeId).ifPresent(user::setCollege);
        }
        if(user.getRole()== Role.ADMIN)
        {
            user.setApproved(false);
        }
        else
            user.setApproved(true);
        User savedUser=userRepo.save(user);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }
    @PostMapping("/login")
    public ResponseEntity<Object> loginUser(@RequestBody LoginRequest loginRequest)
    {
        String email=loginRequest.getEmail();
        String password=loginRequest.getPassword();
        Optional<User>userOpt=userRepo.findByEmail(email);
        if(userOpt==null||!userOpt.get().getPassword().equals(password))
        return new ResponseEntity<>("Inavlid email or password",HttpStatus.BAD_REQUEST);
        User user=userOpt.get();
        if (user.getRole() == Role.ADMIN && !user.isApproved()) {
            return new ResponseEntity<>(Map.of("message", "Your account is pending administrator approval."), HttpStatus.FORBIDDEN);
        }

        return ResponseEntity.ok(user);

    }

}
