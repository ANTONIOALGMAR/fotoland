package com.fotoland.backend.controller;

import com.fotoland.backend.dto.ChatMessage;
import com.fotoland.backend.model.ChatMessageEntity;
import com.fotoland.backend.repository.ChatMessageRepository;
import com.fotoland.backend.service.ChatRoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatMessageController {

    private final ChatMessageRepository messageRepo;
    private final ChatRoomService chatRoomService;

    public ChatMessageController(ChatMessageRepository messageRepo, /* removido: ChatRoomRepository roomRepo, */ ChatRoomService chatRoomService) {
        this.messageRepo = messageRepo;
        // Removido atribuição não utilizada:
        // this.roomRepo = roomRepo;
        this.chatRoomService = chatRoomService;
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<List<ChatMessage>> getRoomMessages(@PathVariable Long roomId, Authentication auth) {
        String username = auth.getName();
        if (!chatRoomService.isMember(roomId, username)) {
            return ResponseEntity.status(403).build();
        }
        List<ChatMessageEntity> entities = messageRepo.findTop50ByRoom_IdOrderByCreatedAtAsc(roomId);
        List<ChatMessage> dtos = entities.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    public static class UpdateMessageRequest { public String content; }

    @PutMapping("/messages/{id}")
    public ResponseEntity<ChatMessage> updateMessage(@PathVariable Long id, @RequestBody UpdateMessageRequest body, Authentication auth) {
        ChatMessageEntity entity = messageRepo.findById(id).orElse(null);
        if (entity == null) return ResponseEntity.notFound().build();

        String username = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (!username.equals(entity.getSenderUsername()) && !isAdmin) {
            return ResponseEntity.status(403).build();
        }

        entity.setContent(body.content);
        entity.setUpdatedAt(Instant.now());
        ChatMessageEntity saved = messageRepo.save(entity);
        return ResponseEntity.ok(toDto(saved));
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id, Authentication auth) {
        ChatMessageEntity entity = messageRepo.findById(id).orElse(null);
        if (entity == null) return ResponseEntity.notFound().build();

        String username = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (!username.equals(entity.getSenderUsername()) && !isAdmin) {
            return ResponseEntity.status(403).build();
        }

        messageRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private ChatMessage toDto(ChatMessageEntity e) {
        ChatMessage dto = new ChatMessage();
        dto.setSender(e.getSenderUsername());
        dto.setContent(e.getContent());
        dto.setTimestamp(e.getClientTimestamp() != null ? e.getClientTimestamp() : e.getCreatedAt().toEpochMilli());
        dto.setRoomId(e.getRoom() != null ? e.getRoom().getId() : null);
        return dto;
    }
}