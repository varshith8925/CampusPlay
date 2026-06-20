package com.SportsBooking.service;

import com.SportsBooking.model.College;
import com.SportsBooking.model.Sport;
import com.SportsBooking.repo.CollegeRepo;
import com.SportsBooking.repo.SportRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SportsService {
    private final SportRepo sportRepo;
    private final CollegeRepo collegeRepo;

    public SportsService(SportRepo sportRepo, CollegeRepo collegeRepo) {
        this.sportRepo = sportRepo;
        this.collegeRepo = collegeRepo;
    }

    public Sport createSport(Sport sport,Long collegeId)
    {
        College college=collegeRepo.findById(collegeId).orElseThrow(()->new RuntimeException("College with this Id not found"));
        sport.setCollege(college);
        return sportRepo.save(sport);
    }
    public List<Sport> getAllSportsByCollegeId(Long collegeId)
    {
        return sportRepo.findByCollegeId(collegeId);
    }
    public Sport getSportById(Long sportId)
    {
        return sportRepo.findById(sportId).orElseThrow(()->new RuntimeException("sport with this id Not found"));
    }
    public Sport updateSportDetails(Long sportId, Sport updatedSportDetails) {
        Sport existingSport = sportRepo.findById(sportId)
                .orElseThrow(() -> new RuntimeException("Sport details not found for ID: " + sportId));


        existingSport.setName(updatedSportDetails.getName());
        existingSport.setDescription(updatedSportDetails.getDescription());
        existingSport.setImageUrl(updatedSportDetails.getImageUrl());
        existingSport.setActive(updatedSportDetails.getActive());

        return sportRepo.save(existingSport);
    }
}
