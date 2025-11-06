package com.fotoland.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notification")
public class Notification {

    public enum Type {
        POST_COMMENT,
        POST_LIKE,
        COMMENT_LIKE,
        CHAT_INVITE,
        CHAT_MESSAGE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    // Payload leve em JSON (ex.: {"roomId":1,"sender":"alice"})
    @Column(nullable = false, length = 2048)
    private String payload;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column
    private Instant readAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }

    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getReadAt() { return readAt; }
    public void setReadAt(Instant readAt) { this.readAt = readAt; }

    public boolean isRead() { return readAt != null; }
}