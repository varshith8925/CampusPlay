package com.SportsBooking.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingResponse {
    private Long bookingId;
    private String studentName;
    private String sportName;
    private String facilityName;
    private String timeSlotInterval;
    private LocalDate bookingDate;
    private String status;
}
