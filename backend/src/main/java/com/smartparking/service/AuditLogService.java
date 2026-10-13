package com.smartparking.service;

import com.smartparking.entity.AuditLog;
import com.smartparking.entity.User;
import com.smartparking.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void record(User adminUser, String action, String entityType, Long entityId, String description) {
        AuditLog log = new AuditLog(adminUser, action, entityType, entityId, description);
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop50ByOrderByCreatedAtDesc();
    }
}
