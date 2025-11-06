package com.fotoland.backend.controller;

import com.fotoland.backend.model.Notification;
import com.fotoland.backend.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public ResponseEntity<Page<Notification>> list(@RequestParam(defaultValue = "ALL") String status,
                                                   Authentication auth,
                                                   Pageable pageable) {
        String username = auth.getName();
        Page<Notification> page;
        if ("UNREAD".equalsIgnoreCase(status)) {
            page = notificationRepository.findByUser_UsernameAndReadAtIsNull(username, pageable);
        } else {
            page = notificationRepository.findByUser_Username(username, pageable);
        }
        return ResponseEntity.ok(page);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id, Authentication auth) {
        Notification n = notificationRepository.findById(id).orElse(null);
        if (n == null) return ResponseEntity.notFound().build();
        if (!n.getUser().getUsername().equals(auth.getName())) return ResponseEntity.status(403).build();
        if (n.getReadAt() == null) {
            n.setReadAt(Instant.now());
            notificationRepository.save(n);
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead(Authentication auth) {
        Page<Notification> unread = notificationRepository.findByUser_UsernameAndReadAtIsNull(auth.getName(), Pageable.ofSize(200));
        unread.forEach(n -> n.setReadAt(Instant.now()));
        notificationRepository.saveAll(unread.getContent());
        return ResponseEntity.ok().build();
    }
}