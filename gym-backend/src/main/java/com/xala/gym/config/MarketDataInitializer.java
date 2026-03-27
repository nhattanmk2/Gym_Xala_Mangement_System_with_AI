package com.xala.gym.config;

import com.xala.gym.entity.Package;
import com.xala.gym.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MarketDataInitializer implements CommandLineRunner {

    private final PackageRepository packageRepository;

    @Override
    public void run(String... args) throws Exception {
        if (packageRepository.count() == 0) {
            Package p1 = new Package();
            p1.setName("Basic Starter");
            p1.setDescription("Gói tập cơ bản dành cho người mới bắt đầu làm quen với Gym, duy trì sức khỏe.");
            p1.setPrice(3000000.0);
            p1.setMaxSessions(12);
            p1.setDurationInDays(30);
            p1.setCategory("NORMAL");
            p1.setPromotion("Tặng 1 buổi đo inbody");
            p1.setActive(true);

            Package p2 = new Package();
            p2.setName("Premium Muscle Builder PRO");
            p2.setDescription("Gói tăng cơ cấp tốc cao cấp dưới sự hướng dẫn 1-1 sát sao. Chuyên sâu về hypertrophy và chế độ dinh dưỡng.");
            p2.setPrice(25000000.0);
            p2.setMaxSessions(36);
            p2.setDurationInDays(90);
            p2.setCategory("WEIGHT_GAIN, MUSCLE");
            p2.setPromotion("Tặng Whey Protein, giáo án dinh dưỡng độc quyền");
            p2.setActive(true);

            Package p3 = new Package();
            p3.setName("Fat Loss VIP Transformation");
            p3.setDescription("Giảm mỡ chuyên sâu, cam kết giảm 3-5kg. Tập luyện kết hợp HIIT và Cardio cường độ cao.");
            p3.setPrice(18000000.0);
            p3.setMaxSessions(30);
            p3.setDurationInDays(90);
            p3.setCategory("WEIGHT_LOSS, CARDIO");
            p3.setPromotion("Tặng Combo Detox, Đánh giá sinh học cơ thể hàng tuần");
            p3.setActive(true);

            Package p4 = new Package();
            p4.setName("Endurance & Core Master");
            p4.setDescription("Tăng cường độ bền bỉ, sức dẻo dai và core. Thích hợp cho người làm văn phòng cần cải thiện tư thế.");
            p4.setPrice(10000000.0);
            p4.setMaxSessions(24);
            p4.setDurationInDays(60);
            p4.setCategory("ENDURANCE");
            p4.setPromotion("Tặng Yoga Thảm");
            p4.setActive(true);

            packageRepository.saveAll(List.of(p1, p2, p3, p4));
            System.out.println("✅ Khởi tạo Seed Data Gói tập thị trường thành công!");
        }
    }
}
