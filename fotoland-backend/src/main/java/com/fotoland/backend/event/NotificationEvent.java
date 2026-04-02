package com.fotoland.backend.event;

import com.fotoland.backend.model.Notification;

import java.time.Instant;
import java.util.Map;

public class NotificationEvent {

    private String username;
    private Notification.Type type;
    private Map<String, Object> payload;
    private Instant occurredAt;

    public NotificationEvent() {
        this.occurredAt = Instant.now();
    }

    public NotificationEvent(String username, Notification.Type type, Map<String, Object> payload) {
        this.username = username;
        this.type = type;
        this.payload = payload;
        this.occurredAt = Instant.now();
    }

    public String getUsername() {
        return username;
    }

    public Notification.Type getType() {
        return type;
    }

    public Map<String, Object> getPayload() {
        return payload;
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setType(Notification.Type type) {
        this.type = type;
    }

    public void setPayload(Map<String, Object> payload) {
        this.payload = payload;
    }

    public void setOccurredAt(Instant occurredAt) {
        this.occurredAt = occurredAt;
    }
}
