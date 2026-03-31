package com.xala.gym;

import com.xala.gym.entity.Booking;
import com.xala.gym.repository.BookingRepository;
import com.xala.gym.service.PtScheduleService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class DebugScheduleTest {

    @Autowired
    private PtScheduleService ptScheduleService;

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    public void testGetAdminSchedules() {
        System.out.println("--- DEBUG: Fetching Admin Schedules ---");
        try {
            var results = ptScheduleService.getAdminSchedules(null, null, null, null);
            System.out.println("Success! Found " + results.size() + " schedules.");
            results.forEach(s -> System.out.println("Schedule ID: " + s.getId() + " - PT: " + s.getPtName() + " - Branch: " + s.getBranchName()));
        } catch (Exception e) {
            System.err.println("FAILED with exception: " + e.getClass().getName());
            System.err.println("Message: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
