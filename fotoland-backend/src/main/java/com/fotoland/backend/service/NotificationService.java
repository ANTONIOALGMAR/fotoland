package com.fotoland.backend.service;

import com.fotoland.backend.model.Notification;
import com.fotoland.backend.model.User;
import com.fotoland.backend.repository.NotificationRepository;
import com.fotoland.backend.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository, SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Notification notifyUser(String username, Notification.Type type, Map<String, Object> payload) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Notification n = new Notification();
        n.setUser(user);
        n.setType(type);
        n.setPayload(toJson(payload));
        n.setCreatedAt(Instant.now());
        Notification saved = notificationRepository.save(n);

        messagingTemplate.convertAndSend("/topic/user." + username, Map.of(
                "id", saved.getId(),
                "type", saved.getType().name(),
                "payload", payload,
                "createdAt", saved.getCreatedAt().toEpochMilli()
        ));

        return saved;
    }

    private String toJson(Map<String, Object> payload) {
        try {
            // implementação simples; pode trocar por Jackson se preferir
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<String, Object> e : payload.entrySet()) {
                if (!first) sb.append(",");
                sb.append("\"").append(e.getKey()).append("\":");
                Object v = e.getValue();
                if (v == null) sb.append("null");
                else if (v instanceof Number || v instanceof Boolean) sb.append(v.toString());
                else sb.append("\"").append(String.valueOf(v).replace("\"", "\\\"")).append("\"");
                first = false;
            }
            sb.append("}");
            return sb.toString();
        } catch (Exception ex) {
            return "{\"error\":\"payload_serialization_failed\"}";
        }
    }
}