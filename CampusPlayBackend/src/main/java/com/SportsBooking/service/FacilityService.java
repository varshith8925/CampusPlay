package com.SportsBooking.service;

import com.SportsBooking.model.Facility;
import com.SportsBooking.model.Sport;
import com.SportsBooking.repo.FacilityRepo;
import com.SportsBooking.repo.SportRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FacilityService {
    private final FacilityRepo facilityRepo;
    private final SportRepo sportRepo;

    public FacilityService(FacilityRepo facilityRepo, SportRepo sportRepo) {
        this.facilityRepo = facilityRepo;
        this.sportRepo = sportRepo;
    }

    public Facility addFacility(Facility facility,Long sportsId)
    {
        Sport sport=sportRepo.findById(sportsId).orElseThrow(()->new RuntimeException("sport with this id not found"));
        facility.setSport(sport);
        return facilityRepo.save(facility);

    }
    public List<Facility> getFacilitiesBySport(Long sportId) {
        return facilityRepo.findBySportId(sportId);
    }

    public Facility getFacilityById(Long id) {
        return facilityRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found with ID: " + id));
    }
}
