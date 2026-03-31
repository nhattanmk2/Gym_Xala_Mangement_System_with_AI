package com.xala.gym;

import com.xala.gym.entity.*;
import com.xala.gym.entity.Package;
import com.xala.gym.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootTest
public class FixPackage14DataTest {

    @Autowired
    private PackageRepository packageRepository;

    @Autowired
    private WorkoutRoadmapRepository roadmapRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Test
    @Transactional
    @Rollback(false)
    public void fixData() {
        System.out.println("--- FIXING PACKAGE 14 DATA ---");
        Package pkg = packageRepository.findById(14L).orElse(null);
        if (pkg == null) {
            System.out.println("Package 14 not found. Creating it...");
            pkg = new Package();
            pkg.setId(14L);
            pkg.setName("Gói tập Thử nghiệm");
            pkg.setPrice(12000000.0);
            pkg.setDurationInDays(90);
            pkg.setActive(true);
            pkg = packageRepository.save(pkg);
        }

        // 1. Add Roadmaps if empty
        List<WorkoutRoadmap> roadmaps = roadmapRepository.findByGymPackageId(14L);
        if (roadmaps.isEmpty()) {
            System.out.println("Adding sample roadmaps...");
            WorkoutRoadmap rm1 = WorkoutRoadmap.builder()
                    .gymPackage(pkg)
                    .name("Giai đoạn 1: Thích nghi")
                    .description("Làm quen với các thiết bị và khởi động cơ thể.")
                    .orderIndex(1)
                    .build();
            roadmapRepository.save(rm1);

            WorkoutRoadmap rm2 = WorkoutRoadmap.builder()
                    .gymPackage(pkg)
                    .name("Giai đoạn 2: Tăng cường")
                    .description("Tập trung vào các bài tập sức bền và kỹ thuật nâng cao.")
                    .orderIndex(2)
                    .build();
            roadmapRepository.save(rm2);
        } else {
            System.out.println("Roadmaps already exist: " + roadmaps.size());
        }

        // 2. Add PTs if empty
        if (pkg.getPersonalTrainers().isEmpty()) {
            System.out.println("Linking PTs...");
            List<Employee> allEmployees = employeeRepository.findAll();
            if (!allEmployees.isEmpty()) {
                pkg.getPersonalTrainers().add(allEmployees.get(0));
                packageRepository.save(pkg);
                System.out.println("Linked PT: " + allEmployees.get(0).getName());
            } else {
                System.out.println("No employees found to link!");
            }
        } else {
            System.out.println("PTs already exist: " + pkg.getPersonalTrainers().size());
        }
        System.out.println("--- FINISHED ---");
    }
}
