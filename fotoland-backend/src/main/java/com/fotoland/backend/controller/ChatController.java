package com.fotoland.backend.controller;

import com.fotoland.backend.dto.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.security.Principal;

import com.fotoland.backend.service.ChatRoomService;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRoomService chatRoomService;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatRoomService chatRoomService) {
        this.messagingTemplate = messagingTemplate;
        this.chatRoomService = chatRoomService;
    }

    @MessageMapping("/chat.send")
    public void sendGlobal(ChatMessage incoming, Principal principal) {
        ChatMessage message = new ChatMessage();
        message.setSender(principal != null ? principal.getName() : incoming.getSender());
        message.setContent(incoming.getContent());
        message.setTimestamp(System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/global", message);
    }

    @MessageMapping("/chat.room.send")
    public void sendRoom(ChatMessage incoming, Principal principal) {
        if (incoming.getRoomId() == null) return;
        String username = principal != null ? principal.getName() : incoming.getSender();
        if (username == null) return;
        if (!chatRoomService.isMember(incoming.getRoomId(), username)) return;

        ChatMessage message = new ChatMessage();
        message.setSender(username);
        message.setContent(incoming.getContent());
        message.setTimestamp(System.currentTimeMillis());
        message.setRoomId(incoming.getRoomId());

        messagingTemplate.convertAndSend("/topic/room." + incoming.getRoomId(), message);
    }
}