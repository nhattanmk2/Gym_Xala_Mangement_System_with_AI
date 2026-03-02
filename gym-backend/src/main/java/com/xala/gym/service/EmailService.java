package com.xala.gym.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendVerificationEmail(String toEmail, String fullName, int verificationCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Gym Xala - Mã xác thực tài khoản");
            
            String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #2b5876; margin: 0;">Chào mừng bạn đến với Gym Xala!</h2>
                    </div>
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <p style="font-size: 16px; color: #333;">Xin chào <strong>%s</strong>,</p>
                        <p style="font-size: 16px; color: #333;">Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất thủ tục đăng ký, vui lòng sử dụng mã xác thực gồm 6 chữ số dưới đây:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="display: inline-block; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #fff; background: linear-gradient(135deg, #2b5876 0%%, #4e4376 100%%); border-radius: 8px;">
                                %d
                            </span>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin-top: 20px;">Mã xác thực này dùng để kích hoạt tài khoản của bạn trên hệ thống. Tuyệt đối không chia sẻ mã này cho người khác.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
                        <p style="font-size: 13px; color: #999; text-align: center; margin: 0;">&copy; 2026 Gym Xala System. All rights reserved.</p>
                    </div>
                </div>
                """.formatted(fullName, verificationCode);

            helper.setText(htmlContent, true);
            mailSender.send(message);

            log.info("📧 Verification email sent successfully to {}", toEmail);
        } catch (MessagingException e) {
            log.error("❌ Failed to send verification email to {}: {}", toEmail, e.getMessage());
        }
    }
}
