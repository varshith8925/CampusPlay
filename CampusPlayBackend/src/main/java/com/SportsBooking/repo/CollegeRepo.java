package com.SportsBooking.repo;

import com.SportsBooking.model.College;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CollegeRepo extends JpaRepository<College,Long> {
}
