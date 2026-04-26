package com.example.spring_server.notification.service;

import com.example.spring_server.notification.dto.LeadNotificationData;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

/**
 * NotificationServiceImpl
 *
 * Gửi email HTML thông báo lead bằng JavaMailSender + Thymeleaf template.
 * Chạy @Async để không block luồng xử lý chính.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.notification.agent-email}")
    private String agentEmail;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    @Override
    public void sendLeadNotification(LeadNotificationData data) {
        try {
            log.info("Đang gửi email thông báo lead cho conversation #{}", data.getConversationId());

            // Chuẩn bị context cho Thymeleaf
            Context context = new Context();
            context.setVariable("customerName",   data.getCustomerName());
            context.setVariable("phone",          data.getPhone());
            context.setVariable("email",          data.getEmail());
            context.setVariable("leadScore",      data.getLeadScore());
            context.setVariable("intentSummary",  data.getIntentSummary());
            context.setVariable("conversationId", data.getConversationId());
            context.setVariable("conversationLink", data.getConversationLink());

            // Render HTML từ template
            String htmlContent = templateEngine.process("lead_notification", context);

            // Tạo và gửi email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(agentEmail);

            // Subject có emoji và badge điểm để dễ nhận diện
            String scoreEmoji = data.getLeadScore() != null && data.getLeadScore() >= 80 ? "🔥🔥" : "🔥";
            helper.setSubject(scoreEmoji + " [SmartAgent] Khách hàng tiềm năng mới - Hội thoại #" + data.getConversationId());
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("✅ Đã gửi email thông báo lead thành công đến {}", agentEmail);

        } catch (MessagingException e) {
            log.error("❌ Lỗi gửi email thông báo lead cho conversation #{}: {}",
                    data.getConversationId(), e.getMessage(), e);
        }
    }
}
