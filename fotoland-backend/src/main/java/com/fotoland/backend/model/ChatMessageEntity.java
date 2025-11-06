package com.fotoland.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "chat_message")
public class ChatMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Sala pode ser nula para mensagens globais
    @ManyToOne
    private ChatRoom room;

    @Column(nullable = false)
    private String senderUsername;

    @Column(nullable = false, length = 2048)
    private String content;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    // timestamp enviado pelo cliente (frontend), opcional
    @Column
    private Long clientTimestamp;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ChatRoom getRoom() { return room; }
    public void setRoom(ChatRoom room) { this.room = room; }

    public String getSenderUsername() { return senderUsername; }
    public void setSenderUsername(String senderUsername) { this.senderUsername = senderUsername; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public Long getClientTimestamp() { return clientTimestamp; }
    public void setClientTimestamp(Long clientTimestamp) { this.clientTimestamp = clientTimestamp; }
}