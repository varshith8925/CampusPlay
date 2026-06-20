package com.SportsBooking.service;

import com.SportsBooking.model.Role;
import com.SportsBooking.model.User;
import com.SportsBooking.repo.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepo userRepo;
    public UserService(UserRepo userRepo)
    {
        this.userRepo=userRepo;
    }
    public List<User> getPendingAdmins()
    {
        return userRepo.findAll().stream()
                .filter(user -> user.getRole() == Role.ADMIN && !user.isApproved())
                .collect(Collectors.toList());
    }
    public User approveAdmin(Long adminId) {
        User admin = userRepo.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
        admin.setApproved(true);
        return userRepo.save(admin);
    }

}
