package com.SportsBooking.repo;

import com.SportsBooking.model.Booking;
import com.SportsBooking.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepo extends JpaRepository<Booking,Long> {
        boolean existsByUserIdAndBookingDateAndTimeSlotIdAndStatus
                (Long userId, LocalDate bookingDate, Long slotId, BookingStatus status);
        //same user ade slot,ade roju malla book cheskoniki rakunda.....

    boolean existsByFacilityIdAndBookingDateAndTimeSlotIdAndStatus
            (Long facilityId,LocalDate bookingDate,Long timeSlotId,BookingStatus status);
    // aa slot bookaynda leda ani check cheyaniki.....

    @Query("SELECT COUNT(b) FROM Booking b " +
            "WHERE b.user.id = :userId " +
            "AND b.facility.sport.id = :sportId " +
            "AND b.bookingDate = :date " +
            "AND b.status = :status")
    long countActiveSportBookings(
            @Param("userId") Long userId,
            @Param("sportId") Long sportId,
            @Param("date") LocalDate date,
            @Param("status") BookingStatus status);
    //user enni bookimgs cheskunadu..oka particular sport ki...


    List<Booking> findByUserId(Long userId);

    List<Booking> findByFacilityIdAndBookingDateAndStatus(Long facilityId, LocalDate bookingDate, BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.facility.sport.college.id = :collegeId AND b.status = :status")
    List<Booking> findByCollegeIdAndStatus(@Param("collegeId") Long collegeId, @Param("status") BookingStatus status);

}
