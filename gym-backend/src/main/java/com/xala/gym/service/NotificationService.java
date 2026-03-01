package com.xala.gym.service;

import com.xala.gym.entity.Notification;
import java.util.List;

public interface NotificationService {
    List<Notification> getMyNotifications();
    void markAsRead(Long id);
    void markAllAsRead();
    long getUnreadCount();
    void sendNotification(Long recipientId, String message, String type);
}
