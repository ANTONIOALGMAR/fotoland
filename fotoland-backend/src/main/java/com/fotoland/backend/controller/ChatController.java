package com.fotoland.backend.controller;

import com.fotoland.backend.dto.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.send")
    public void sendGlobal(ChatMessage incoming, Principal principal) {
        ChatMessage message = new ChatMessage();
        message.setSender(principal != null ? principal.getName() : incoming.getSender());
        message.setContent(incoming.getContent());
        message.setTimestamp(System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/global", message);
    }
}