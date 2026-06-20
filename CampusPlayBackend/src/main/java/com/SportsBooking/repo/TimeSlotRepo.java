package com.SportsBooking.repo;

import com.SportsBooking.model.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimeSlotRepo extends JpaRepository<TimeSlot,Long> {
}
