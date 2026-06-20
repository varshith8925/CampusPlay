package com.SportsBooking.service;

import com.SportsBooking.model.*;
import com.SportsBooking.repo.BookingRepo;
import com.SportsBooking.repo.FacilityRepo;
import com.SportsBooking.repo.TimeSlotRepo;
import com.SportsBooking.repo.TimeSlotRepo;
import com.SportsBooking.repo.UserRepo;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {
    private final BookingRepo bookingRepo;
    private final UserRepo userRepo;
    private final TimeSlotRepo timeSlotRepo;
    private final FacilityRepo facilityRepo;

    public BookingService(BookingRepo bookingRepo, UserRepo userRepo, TimeSlotRepo timeSlotRepo, FacilityRepo facilityRepo) {
        this.bookingRepo = bookingRepo;
        this.userRepo = userRepo;
        this.timeSlotRepo = timeSlotRepo;
        this.facilityRepo = facilityRepo;
    }
    public Booking createBooking(Long userId, Long facilityId, Long timeSlotId, LocalDate bookingDate)
    {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Facility facility = facilityRepo.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        TimeSlot slot = timeSlotRepo.findById(timeSlotId)
                .orElseThrow(() -> new RuntimeException("Time slot not found"));

        if(bookingDate.isBefore(LocalDate.now()))
            throw new RuntimeException("can book for the past dates");

        boolean studentHasSlot=bookingRepo.existsByUserIdAndBookingDateAndTimeSlotIdAndStatus(userId,bookingDate,timeSlotId, BookingStatus.BOOKED);
        if(studentHasSlot==true)
        {
            throw new RuntimeException("you already have a slot booked in this time slot");
        }


        boolean facilityIsTaken=bookingRepo.existsByFacilityIdAndBookingDateAndTimeSlotIdAndStatus(facilityId,bookingDate,timeSlotId,BookingStatus.BOOKED);
        if(facilityIsTaken)
            throw new RuntimeException("this court is already booked");

        Long  activeBookingCount=bookingRepo.countActiveSportBookings(userId,facility.getSport().getId(),bookingDate,BookingStatus.BOOKED);
        if(activeBookingCount>=2)
        {
            throw new RuntimeException("you cant book more than two slots per day for a particular sport");
        }

        Booking booking=new Booking();
        booking.setUser(user);
        booking.setFacility(facility);
        booking.setTimeSlot(slot);
        booking.setBookingDate(bookingDate);
        booking.setStatus(BookingStatus.BOOKED);

        return bookingRepo.save(booking);

    }
    @Transactional
    public void cancelBooking(Long bookingId)
    {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepo.save(booking);
    }

    public List<Booking> getStudentBookings(Long userId) {
        return bookingRepo.findByUserId(userId);
    }

    public List<Booking> getBookingsByFacilityAndDate(Long facilityId, LocalDate date) {
        return bookingRepo.findByFacilityIdAndBookingDateAndStatus(facilityId, date, BookingStatus.BOOKED);
    }

    public List<Booking> getBookingsByCollege(Long collegeId) {
        return bookingRepo.findByCollegeIdAndStatus(collegeId, BookingStatus.BOOKED);
    }

}
