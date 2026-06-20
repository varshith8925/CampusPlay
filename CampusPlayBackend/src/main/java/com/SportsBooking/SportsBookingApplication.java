package com.SportsBooking;

import com.SportsBooking.model.TimeSlot;
import com.SportsBooking.repo.TimeSlotRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalTime;
import java.util.List;

@SpringBootApplication
public class SportsBookingApplication {

	public static void main(String[] args) {
		SpringApplication.run(SportsBookingApplication.class, args);
	}

	@Bean
	public CommandLineRunner seedDatabase(TimeSlotRepo repo) {
		return (args) -> {
			if (repo.count() == 0) {
				repo.saveAll(List.of(
					new TimeSlot(null, LocalTime.of(6, 0), LocalTime.of(6, 40), true),
					new TimeSlot(null, LocalTime.of(6, 40), LocalTime.of(7, 20), true),
					new TimeSlot(null, LocalTime.of(7, 20), LocalTime.of(8, 0), true),
					new TimeSlot(null, LocalTime.of(8, 0), LocalTime.of(8, 40), true),
					new TimeSlot(null, LocalTime.of(8, 40), LocalTime.of(9, 20), true),

					new TimeSlot(null, LocalTime.of(15, 0), LocalTime.of(15, 40), true),
				new TimeSlot(null, LocalTime.of(15, 40), LocalTime.of(16, 20), true),
				new TimeSlot(null, LocalTime.of(16, 20), LocalTime.of(17, 00), true),
				new TimeSlot(null, LocalTime.of(17, 00), LocalTime.of(17, 40), true),
						new TimeSlot(null, LocalTime.of(17, 40), LocalTime.of(18, 20), true),
					new TimeSlot(null, LocalTime.of(18, 20), LocalTime.of(19, 00), true)
				));
				System.out.println("Time slots added in the database...");
				//tarvata time slots admin edit cheyochu laga feature implemeent cheddam..
			}
		};
	}
}
