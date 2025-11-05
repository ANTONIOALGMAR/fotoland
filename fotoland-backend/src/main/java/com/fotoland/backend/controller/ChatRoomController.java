package com.fotoland.backend.controller;

import com.fotoland.backend.model.ChatInvite;
import com.fotoland.backend.model.ChatRoom;
import com.fotoland.backend.model.ChatRoomMember;
import com.fotoland.backend.service.ChatRoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    public ChatRoomController(ChatRoomService chatRoomService) {
        this.chatRoomService = chatRoomService;
    }

    public static class CreateRoomRequest { public String name; }
    public static class InviteRequest { public String username; }

    @PostMapping("/rooms")
    public ResponseEntity<ChatRoom> createRoom(@RequestBody CreateRoomRequest body, Authentication auth) {
        String username = auth.getName();
        ChatRoom room = chatRoomService.createRoom(body.name, username);
        return ResponseEntity.ok(room);
    }

    @GetMapping("/rooms/mine")
    public ResponseEntity<List<ChatRoomMember>> myRooms(Authentication auth) {
        String username = auth.getName();
        List<ChatRoomMember> memberships = chatRoomService.findMemberships(username);
        return ResponseEntity.ok(memberships);
    }

    @PostMapping("/rooms/{roomId}/invite")
    public ResponseEntity<ChatInvite> invite(@PathVariable Long roomId, @RequestBody InviteRequest body, Authentication auth) {
        String inviter = auth.getName();
        ChatInvite invite = chatRoomService.invite(roomId, body.username, inviter);
        return ResponseEntity.ok(invite);
    }

    @PostMapping("/invites/{inviteId}/accept")
    public ResponseEntity<Void> accept(@PathVariable Long inviteId, Authentication auth) {
        chatRoomService.acceptInvite(inviteId, auth.getName());
        return ResponseEntity.ok().build();
    }
}