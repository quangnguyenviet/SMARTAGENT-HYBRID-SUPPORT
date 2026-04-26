package com.example.spring_server.notification.service;

import com.example.spring_server.notification.dto.LeadNotificationData;

/**
 * NotificationService
 *
 * Xử lý việc gửi thông báo email cho nhân viên khi phát hiện lead tiềm năng.
 */
public interface NotificationService {

    /**
     * Gửi email thông báo lead đến nhân viên.
     *
     * @param data Thông tin lead cần thông báo
     */
    void sendLeadNotification(LeadNotificationData data);
}
