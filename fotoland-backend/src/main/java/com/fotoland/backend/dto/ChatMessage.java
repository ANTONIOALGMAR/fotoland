package com.fotoland.backend.dto;

import lombok.Data;

@Data
public class ChatMessage {
    private String sender;
    private String content;
    private long timestamp;
    private Long roomId;
    private String profilePictureUrl;
}