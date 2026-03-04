package com.xala.gym.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xala.gym.dto.request.AIConsultationRequest;
import com.xala.gym.dto.response.AIConsultationResponse;
import com.xala.gym.dto.response.PackageResponse;
import com.xala.gym.dto.response.RecommendedPackageDto;
import com.xala.gym.entity.Package;
import com.xala.gym.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
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
                            recommendedPackages.add(new RecommendedPackageDto(foundPkg, reason));
                        }
                    }
                }

                return AIConsultationResponse.builder()
                        .bmi(bmi)
                        .bmiCategory(bmiCategory)
                        .advice(advice)
                        .recommendedPackages(recommendedPackages)
                        .build();

            } catch (Exception e) {
                System.err.println("Failed to parse Gemini JSON: " + e.getMessage());
                // Fallback xuống dưới
            }
        }

        // Fallback response nếu Gemini lỗi hoặc Parse lỗi
        return AIConsultationResponse.builder()
                .bmi(0.0)
                .bmiCategory("Chưa xác định")
                .advice("Xin lỗi, Chuyên gia AI đang bận. Vui lòng thử lại sau.")
                .recommendedPackages(new ArrayList<>())
                .build();
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
                .category(pkg.getCategory())
                .image(pkg.getImage())
                .promotion(pkg.getPromotion())
                .build();
    }
}
