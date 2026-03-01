package com.xala.gym.service.impl;

import com.xala.gym.entity.Notification;
import com.xala.gym.entity.User;
import com.xala.gym.repository.NotificationRepository;
import com.xala.gym.repository.UserRepository;
import com.xala.gym.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public List<Notification> getMyNotifications() {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(getCurrentUser().getId());
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification không tồn tại"));
        
        if (!notification.getRecipient().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Bạn không có quyền thực hiện hành động này");
        }
        
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        List<Notification> unread = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(getCurrentUser().getId())
                .stream().filter(n -> !n.isRead()).toList();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    public long getUnreadCount() {
        return notificationRepository.countByRecipientIdAndIsReadFalse(getCurrentUser().getId());
    }

    @Override
    @Transactional
    public void sendNotification(Long recipientId, String message, String type) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Dân chơi này không tồn tại!"));
        
        Notification notification = Notification.builder()
                .recipient(recipient)
                .message(message)
                .type(type)
                .build();
        
        notificationRepository.save(notification);
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
}
