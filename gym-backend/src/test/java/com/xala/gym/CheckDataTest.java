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
    private PackageRepository packageRepository;

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
