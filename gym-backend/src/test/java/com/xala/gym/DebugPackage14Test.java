package com.xala.gym;

import com.xala.gym.entity.*;
import com.xala.gym.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
public class DebugPackage14Test {

    @Autowired
    private PackageRepository packageRepository;

    @Autowired
    private WorkoutRoadmapRepository roadmapRepository;

    @Test
    @Transactional
    public void debugPackage14() {
        System.out.println("--- DEBUG PACKAGE 14 ---");
        packageRepository.findById(14L).ifPresentOrElse(pkg -> {
            System.out.println("Package Found: " + pkg.getName());
            System.out.println("PTs count: " + pkg.getPersonalTrainers().size());
            pkg.getPersonalTrainers().forEach(pt -> System.out.println(" - PT: " + pt.getName()));
            
            long roadmapCount = roadmapRepository.findByGymPackageId(14L).size();
            System.out.println("Roadmaps count (via repo): " + roadmapCount);
            
        }, () -> {
            System.out.println("Package 14 NOT FOUND!");
        });
        System.out.println("------------------------");
    }
}
