package com.SportsBooking.repo;

import com.SportsBooking.model.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRepo extends JpaRepository<Facility,Long> {

    List<Facility> findBySportId(Long sportId);

}
