package com.SportsBooking.repo;

import com.SportsBooking.model.Sport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SportRepo extends JpaRepository<Sport,Long> {
    List<Sport> findByCollegeId(Long collegeId);
}
