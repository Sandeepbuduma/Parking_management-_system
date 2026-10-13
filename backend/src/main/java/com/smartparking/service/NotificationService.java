package com.smartparking.service;

import com.smartparking.dto.NotificationResponse;
import com.smartparking.entity.Notification;
import com.smartparking.entity.User;
import com.smartparking.entity.enums.NotificationType;
import com.smartparking.exception.ResourceNotFoundException;
import com.smartparking.mapper.DtoMapper;
import com.smartparking.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void createNotification(User user, String title, String message, NotificationType type) {
        Notification notif = new Notification(user, title, message, type);
        notificationRepository.save(notif);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(DtoMapper::toNotificationResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        Notification notif = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notif.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found for current user");
        }

        notif.setRead(true);
        Notification saved = notificationRepository.save(notif);
        return DtoMapper.toNotificationResponse(saved);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}
