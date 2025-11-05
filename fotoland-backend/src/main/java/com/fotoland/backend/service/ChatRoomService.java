package com.fotoland.backend.service;

import com.fotoland.backend.model.*;
import com.fotoland.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatRoomService {

    private final ChatRoomRepository roomRepo;
    private final ChatRoomMemberRepository memberRepo;
    private final ChatInviteRepository inviteRepo;
    private final UserService userService;

    public ChatRoomService(ChatRoomRepository roomRepo, ChatRoomMemberRepository memberRepo, ChatInviteRepository inviteRepo, UserService userService) {
        this.roomRepo = roomRepo;
        this.memberRepo = memberRepo;
        this.inviteRepo = inviteRepo;
        this.userService = userService;
    }

    @Transactional
    public ChatRoom createRoom(String name, String ownerUsername) {
        User owner = userService.findByUsername(ownerUsername);
        ChatRoom room = new ChatRoom();
        room.setName(name);
        room.setOwner(owner);
        ChatRoom saved = roomRepo.save(room);
        ChatRoomMember ownerMember = new ChatRoomMember();
        ownerMember.setRoom(saved);
        ownerMember.setUser(owner);
        memberRepo.save(ownerMember);
        return saved;
    }

    public List<ChatRoomMember> findMemberships(String username) {
        return memberRepo.findByUser_Username(username);
    }

    public boolean isMember(Long roomId, String username) {
        User user = userService.findByUsername(username);
        return memberRepo.existsByRoom_IdAndUser_Id(roomId, user.getId());
    }

    @Transactional
    public ChatInvite invite(Long roomId, String invitedUsername, String invitedByUsername) {
        User invitedBy = userService.findByUsername(invitedByUsername);
        User invitedUser = userService.findByUsername(invitedUsername);
        ChatRoom room = roomRepo.findById(roomId).orElseThrow(() -> new RuntimeException("Room not found"));
        if (!isMember(roomId, invitedByUsername)) throw new RuntimeException("Inviter is not a room member");

        ChatInvite invite = new ChatInvite();
        invite.setRoom(room);
        invite.setInvitedBy(invitedBy);
        invite.setInvitedUser(invitedUser);
        invite.setStatus(ChatInvite.Status.PENDING);
        return inviteRepo.save(invite);
    }

    @Transactional
    public void acceptInvite(Long inviteId, String username) {
        ChatInvite invite = inviteRepo.findById(inviteId).orElseThrow(() -> new RuntimeException("Invite not found"));
        if (!invite.getInvitedUser().getUsername().equals(username)) throw new RuntimeException("Cannot accept invite of another user");
        invite.setStatus(ChatInvite.Status.ACCEPTED);
        inviteRepo.save(invite);

        ChatRoomMember member = new ChatRoomMember();
        member.setRoom(invite.getRoom());
        member.setUser(invite.getInvitedUser());
        memberRepo.save(member);
    }
}