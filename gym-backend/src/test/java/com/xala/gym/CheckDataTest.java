package com.xala.gym;

import com.xala.gym.entity.*;
import com.xala.gym.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
public class CheckDataTest {

    @Autowired
    private StandardExerciseRepository standardExerciseRepository;
    @Autowired
    private ExerciseLevelRepository exerciseLevelRepository;
    @Autowired
    private ExerciseCategoryRepository exerciseCategoryRepository;

    @Autowired
    private MembershipCardRepository membershipCardRepository;
    @Autowired
    private PackageRepository packageRepository;

    @Test
    public void testCheckInvoices() {
        System.out.println("--- DB STATUS CHECK ---");
        long totalDB = membershipCardRepository.count();
        System.out.println("TOTAL MembershipCards in DB: " + totalDB);

        // 1. All via Filter
        List<MembershipCard> allFilter = membershipCardRepository.findInvoicesByFilters("", null, null, null);
        System.out.println("Filter by '' count: " + allFilter.size());

        List<MembershipCard> allKeyword = membershipCardRepository.findInvoicesByFilters("ALL", null, null, null);
        System.out.println("Filter by 'ALL' count: " + allKeyword.size());

        // 2. Counts by status
        System.out.println("PENDING count: " + membershipCardRepository.countByStatus("PENDING"));
        System.out.println("ACTIVE count: " + membershipCardRepository.countByStatus("ACTIVE"));
        System.out.println("CANCELLED count: " + membershipCardRepository.countByStatus("CANCELLED"));
        
        System.out.println("------------------------");
    }

    @Test
    public void testCheckData() {
        System.out.println("--- PACKAGES ---");
        packageRepository.findAll().forEach(p -> System.out.println("ID: " + p.getId() + " - Name: " + p.getName()));
        System.out.println("----------------");
        System.out.println("Categories count: " + exerciseCategoryRepository.count());
        System.out.println("Standard Exercises count: " + standardExerciseRepository.count());
        System.out.println("Exercise Levels count: " + exerciseLevelRepository.count());
    }
}
