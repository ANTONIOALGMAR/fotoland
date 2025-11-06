package com.fotoland.backend.controller;

import com.fotoland.backend.dto.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.security.Principal;

import com.fotoland.backend.service.ChatRoomService;
import com.fotoland.backend.repository.ChatMessageRepository;
import com.fotoland.backend.repository.ChatRoomRepository;
import com.fotoland.backend.repository.ChatRoomMemberRepository;
import com.fotoland.backend.model.ChatMessageEntity;
import com.fotoland.backend.model.ChatRoom;

import com.fotoland.backend.repository.UserRepository;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRoomService chatRoomService;
    private final ChatMessageRepository messageRepo;
    private final ChatRoomRepository roomRepo;
    private final ChatRoomMemberRepository memberRepo;
    private final com.fotoland.backend.service.NotificationService notificationService;
    private final UserRepository userRepository;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatRoomService chatRoomService,
                          ChatMessageRepository messageRepo, ChatRoomRepository roomRepo,
                          ChatRoomMemberRepository memberRepo,
                          com.fotoland.backend.service.NotificationService notificationService,
                          UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.chatRoomService = chatRoomService;
        this.messageRepo = messageRepo;
        this.roomRepo = roomRepo;
        this.memberRepo = memberRepo;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @MessageMapping("/chat.send")
    public void sendGlobal(ChatMessage incoming, Principal principal) {
        String username = principal != null ? principal.getName() : incoming.getSender();
        if (username == null) return;

        ChatMessage message = new ChatMessage();
        message.setSender(username);
        message.setContent(incoming.getContent());
        message.setTimestamp(System.currentTimeMillis());

        userRepository.findByUsername(username).ifPresent(user -> {
            message.setProfilePictureUrl(user.getProfilePictureUrl());
        });

        // Persistência global
        ChatMessageEntity entity = new ChatMessageEntity();
        entity.setRoom(null);
        entity.setSenderUsername(message.getSender());
        entity.setContent(message.getContent());
        entity.setClientTimestamp(incoming.getTimestamp());
        messageRepo.save(entity);

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

        userRepository.findByUsername(username).ifPresent(user -> {
            message.setProfilePictureUrl(user.getProfilePictureUrl());
        });

        ChatRoom room = roomRepo.findById(incoming.getRoomId()).orElse(null);
        if (room != null) {
            ChatMessageEntity entity = new ChatMessageEntity();
            entity.setRoom(room);
            entity.setSenderUsername(username);
            entity.setContent(incoming.getContent());
            entity.setClientTimestamp(incoming.getTimestamp());
            messageRepo.save(entity);

            // Notificar demais membros da sala (exclui o remetente)
            for (var m : memberRepo.findByRoom_Id(room.getId())) {
                String target = m.getUser().getUsername();
                if (!target.equals(username)) {
                    notificationService.notifyUser(target, com.fotoland.backend.model.Notification.Type.CHAT_MESSAGE,
                        java.util.Map.of("roomId", room.getId(), "sender", username));
                }
            }
        }

        messagingTemplate.convertAndSend("/topic/room." + incoming.getRoomId(), message);
    }
}