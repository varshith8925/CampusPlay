package com.SportsBooking.controller;
import com.SportsBooking.dto.BookingRequest;
import com.SportsBooking.dto.BookingResponse;
import com.SportsBooking.model.Booking;
import com.SportsBooking.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.time.LocalDate;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> bookSlot(@RequestBody BookingRequest request) {
        Booking booking = bookingService.createBooking(
                request.getUserId(),
                request.getFacilityId(),
                request.getSlotId(),
                request.getBookingDate()
        );
        return new ResponseEntity<>(convertToResponseDto(booking), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> cancelBooking(@PathVariable Long id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.ok("Booking cancelled successfully.");
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@PathVariable Long userId) {
        List<Booking> bookings = bookingService.getStudentBookings(userId);
        List<BookingResponse> responses = bookings.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/facility/{facilityId}/date/{date}")
    public ResponseEntity<List<BookingResponse>> getBookingsByFacilityAndDate(
            @PathVariable Long facilityId, @PathVariable LocalDate date) {
        List<Booking> bookings = bookingService.getBookingsByFacilityAndDate(facilityId, date);
        List<BookingResponse> responses = bookings.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/college/{collegeId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByCollege(@PathVariable Long collegeId) {
        List<Booking> bookings = bookingService.getBookingsByCollege(collegeId);
        List<BookingResponse> responses = bookings.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }



    private BookingResponse convertToResponseDto(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setBookingId(booking.getId());
        response.setStudentName(booking.getUser().getName());
        response.setSportName(booking.getFacility().getSport().getName());
        response.setFacilityName(booking.getFacility().getName());
        response.setTimeSlotInterval(booking.getTimeSlot().getStartTime() + " - " + booking.getTimeSlot().getEndTime());
        response.setBookingDate(booking.getBookingDate());
        response.setStatus(booking.getStatus().name());
        return response;
    }
}