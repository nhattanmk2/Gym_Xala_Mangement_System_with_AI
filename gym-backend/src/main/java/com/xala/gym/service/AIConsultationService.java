package com.xala.gym.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xala.gym.dto.request.AIConsultationRequest;
import com.xala.gym.dto.response.AIConsultationResponse;
import com.xala.gym.dto.response.PackageResponse;
import com.xala.gym.dto.response.RecommendedPackageDto;
import com.xala.gym.dto.request.PtMatchingRequest;
import com.xala.gym.dto.response.PtMatchingResponse;
import com.xala.gym.entity.AIConsultationHistory;
import com.xala.gym.entity.Package;
import com.xala.gym.entity.User;
import com.xala.gym.repository.AIConsultationHistoryRepository;
import com.xala.gym.repository.PackageRepository;
import com.xala.gym.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIConsultationService {

    private final PackageRepository packageRepository;
    private final GeminiService geminiService;
    private final PtMatchingService ptMatchingService;
    private final AIConsultationHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public AIConsultationResponse getConsultation(AIConsultationRequest request) {
        // Lấy tất cả Package đang active map sang DTO tối giản để nhét vào Prompt cho nhẹ
        List<PackageResponse> allPackages = packageRepository.findAll().stream()
                .filter(Package::getActive)
                .map(this::mapToPackageResponse)
                .collect(Collectors.toList());

        // Xây dựng Prompt
        String prompt = buildPrompt(request, allPackages);

        // Gọi Gemini API
        String aiResponseText = geminiService.generateConsultation(prompt);

        if (aiResponseText != null) {
            try {
                // Gemini thường bọc JSON trong markdown ```json ... ```
                String jsonContent = aiResponseText;
                if (aiResponseText.contains("```json")) {
                    jsonContent = aiResponseText.substring(aiResponseText.indexOf("```json") + 7);
                    if (jsonContent.contains("```")) {
                        jsonContent = jsonContent.substring(0, jsonContent.lastIndexOf("```"));
                    }
                } else if (aiResponseText.startsWith("```")) {
                    jsonContent = aiResponseText.substring(3, aiResponseText.length() - 3);
                }

                jsonContent = jsonContent.trim();

                // Build type reference to parse the custom JSON structure from prompt
                Map<String, Object> aiResultMap = objectMapper.readValue(jsonContent, new TypeReference<Map<String, Object>>() {});
                
                double bmi = 0.0;
                if (aiResultMap.get("bmi") != null) {
                    bmi = Double.parseDouble(aiResultMap.get("bmi").toString());
                }
                String bmiCategory = (String) aiResultMap.get("bmiCategory");
                String advice = (String) aiResultMap.get("advice");

                List<RecommendedPackageDto> recommendedPackages = new ArrayList<>();
                List<Map<String, Object>> recList = (List<Map<String, Object>>) aiResultMap.get("recommendations");
                
                if (recList != null) {
                    for (Map<String, Object> recInfo : recList) {
                        Long pkgId = Long.parseLong(recInfo.get("packageId").toString());
                        String reason = (String) recInfo.get("reason");
                        
                        // Tìm package trong danh sách
                        PackageResponse foundPkg = allPackages.stream()
                            .filter(p -> p.getId().equals(pkgId))
                            .findFirst().orElse(null);
                        
                        if (foundPkg != null) {
                            // Gọi thuật toán so khớp để lấy top PT phù hợp cho gói này
                            PtMatchingRequest matchRequest = PtMatchingRequest.builder()
                                    .packageId(foundPkg.getId())
                                    .preferredStartTime(request.getPreferredStartTime())
                                    .preferredEndTime(request.getPreferredEndTime())
                                    .build();
                                    
                            List<PtMatchingResponse> topPts = ptMatchingService.matchPt(matchRequest).stream()
                                    .limit(3) // Lấy top 3 PT
                                    .collect(Collectors.toList());

                            recommendedPackages.add(new RecommendedPackageDto(foundPkg, reason, topPts));
                        }
                    }
                }

                AIConsultationResponse response = AIConsultationResponse.builder()
                        .bmi(bmi)
                        .bmiCategory(bmiCategory)
                        .advice(advice)
                        .recommendedPackages(recommendedPackages)
                        .build();

                // Lưu lịch sử
                try {
                    String username = SecurityContextHolder.getContext().getAuthentication().getName();
                    User member = userRepository.findByUsername(username).orElse(null);
                    if (member != null) {
                        // Tối ưu JSON: Bỏ cột image (byte[]) ra để chống lỗi DataTruncation
                        List<RecommendedPackageDto> historyPackages = recommendedPackages.stream().map(pkgDto -> {
                            PackageResponse noImgPkg = PackageResponse.builder()
                                    .id(pkgDto.getPackageInfo().getId())
                                    .name(pkgDto.getPackageInfo().getName())
                                    .description(pkgDto.getPackageInfo().getDescription())
                                    .price(pkgDto.getPackageInfo().getPrice())
                                    .durationInDays(pkgDto.getPackageInfo().getDurationInDays())
                                    .maxSessions(pkgDto.getPackageInfo().getMaxSessions())
                                    .category(pkgDto.getPackageInfo().getCategory())
                                    .promotion(pkgDto.getPackageInfo().getPromotion())
                                    // Bố trí lại image = null
                                    .image(null)
                                    .build();
                            return new RecommendedPackageDto(noImgPkg, pkgDto.getReason(), pkgDto.getRecommendedPts());
                        }).collect(Collectors.toList());

                        AIConsultationHistory history = AIConsultationHistory.builder()
                                .member(member)
                                .weight(request.getWeight())
                                .height(request.getHeight())
                                .age(request.getAge())
                                .gender(request.getGender())
                                .goal(request.getGoal())
                                .bmi(bmi)
                                .bmiCategory(bmiCategory)
                                .advice(advice)
                                .recommendationJson(objectMapper.writeValueAsString(historyPackages))
                                .build();
                        historyRepository.save(history);
                    }
                } catch (Exception e) {
                    System.err.println("Failed to save AI consultation history: " + e.getMessage());
                }

                return response;

            } catch (Exception e) {
                System.err.println("Failed to parse Gemini JSON: " + e.getMessage());
                // Fallback xuống dưới
            }
        }

        // Fallback response nếu Gemini lỗi hoặc Parse lỗi
        double heightInMeters = request.getHeight() / 100.0;
        double calculatedBmi = request.getWeight() / (heightInMeters * heightInMeters);
        calculatedBmi = Math.round(calculatedBmi * 10.0) / 10.0;
        
        String calculatedCategory = "Bình thường";
        if (calculatedBmi < 18.5) {
            calculatedCategory = "Thiếu cân";
        } else if (calculatedBmi >= 25.0) {
            calculatedCategory = "Thừa cân";
        }

        return AIConsultationResponse.builder()
                .bmi(calculatedBmi)
                .bmiCategory(calculatedCategory)
                .advice("Hệ thống AI đang quá tải. Xin vui lòng thử lại sau, nhưng dựa trên chiều cao cân nặng của bạn, hệ thống đã tính được BMI cơ bản.")
                .recommendedPackages(new ArrayList<>())
                .build();
    }

    public List<AIConsultationHistory> getHistory(String username) {
        User member = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
        return historyRepository.findByMember_IdOrderByConsultationTimeDesc(member.getId());
    }

    private String buildPrompt(AIConsultationRequest req, List<PackageResponse> pkgs) {
        StringBuilder sb = new StringBuilder();
        sb.append("Bạn là một Chuyên gia Thể hình (PT AI) của phòng tập Gym Xala. ");
        sb.append("Hãy tư vấn cho tôi một lộ trình và các gói tập phù hợp dựa trên thông tin sau.\n\n");
        sb.append("THÔNG TIN KHÁCH HÀNG:\n");
        sb.append("- Giới tính: ").append(req.getGender().equals("MALE") ? "Nam" : "Nữ").append("\n");
        sb.append("- Tuổi: ").append(req.getAge()).append("\n");
        sb.append("- Chiều cao: ").append(req.getHeight()).append(" cm\n");
        sb.append("- Cân nặng: ").append(req.getWeight()).append(" kg\n");
        sb.append("- Mục tiêu: ").append(req.getGoal()).append(" (WEIGHT_LOSS=Giảm mỡ, MUSCLE_GAIN=Tăng cơ, MAINTAIN=Giữ dáng)\n\n");
        
        sb.append("DANH SÁCH GÓI TẬP HIỆN CÓ CỦA GYM XALA:\n");
        try {
            // Chỉ Serialize id, name, price, description, durationInDays để AI hiểu
            List<Map<String, Object>> simplePkgs = pkgs.stream().map(p -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", p.getId());
                map.put("name", p.getName());
                map.put("price", p.getPrice());
                map.put("desc", p.getDescription());
                return map;
            }).collect(Collectors.toList());
            sb.append(objectMapper.writeValueAsString(simplePkgs)).append("\n\n");
        } catch (Exception e) {
            sb.append("[]\n\n");
        }
        
        sb.append("NHIỆM VỤ CỦA BẠN LÀ MỘT CHUYÊN GIA:\n");
        sb.append("1. Tính toán BMI chính xác.\n");
        sb.append("2. Phân loại BMI kèm tư vấn nhiệt tình, thân thiện như 1 PT giàu kinh nghiệm.\n");
        sb.append("3. Lựa chọn từ 1 đến 3 thẻ tập phù hợp nhất TỪ DANH SÁCH TRÊN (không bịa ra gói ngoài danh sách).\n");
        sb.append("  - Nếu mục tiêu TĂNG CƠ, đặc biệt ưu tiên khuyên dùng gói có chữ 'PT' hoặc 'VIP'.\n");
        sb.append("4. VIẾT lý do thuyết phục cho TỪNG thẻ tập vì sao nó phù hợp với khách hàng này.\n\n");

        sb.append("YÊU CẦU ĐẦU RA BẮT BUỘC (Trả về STRICT JSON, không kèm bất kỳ giải thích nào bên ngoài):\n");
        sb.append("```json\n");
        sb.append("{\n");
        sb.append("  \"bmi\": 24.5,\n");
        sb.append("  \"bmiCategory\": \"Bình thường\",\n");
        sb.append("  \"advice\": \"Văn bản tư vấn tâm huyết...\",\n");
        sb.append("  \"recommendations\": [\n");
        sb.append("    { \"packageId\": 1, \"reason\": \"Lý do...\" }\n");
        sb.append("  ]\n");
        sb.append("}\n");
        sb.append("```");

        return sb.toString();
    }

    private PackageResponse mapToPackageResponse(Package pkg) {
        return PackageResponse.builder()
                .id(pkg.getId())
                .name(pkg.getName())
                .description(pkg.getDescription())
                .price(pkg.getPrice())
                .durationInDays(pkg.getDurationInDays()) // days
                .maxSessions(pkg.getMaxSessions())
                .category(pkg.getCategory())
                .image(pkg.getImage())
                .promotion(pkg.getPromotion())
                .build();
    }
}
