package com.SportsBooking.dto;

import lombok.Data;

import java.time.LocalDate;
@Data
public class BookingRequest {
    private Long userId;
    private Long facilityId;
    private Long slotId;
    private LocalDate bookingDate;
}
