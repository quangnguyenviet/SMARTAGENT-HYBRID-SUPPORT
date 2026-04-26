package com.example.spring_server.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dữ liệu gom lại để gửi email thông báo lead cho nhân viên.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadNotificationData {

    // Thông tin khách hàng
    private String customerName;
    private String phone;
    private String email;

    // Thông tin phân tích AI
    private Integer leadScore;
    private String intentSummary;

    // Tóm tắt hội thoại do AI tạo ra
    private String conversationSummary;

    // Thông tin hội thoại
    private Long conversationId;
    private String conversationLink;
}
