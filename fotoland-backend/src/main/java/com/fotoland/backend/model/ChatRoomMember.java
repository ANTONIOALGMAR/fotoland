package com.fotoland.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "chat_room_member", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"room_id", "user_id"})
})
public class ChatRoomMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private ChatRoom room;

    @ManyToOne(optional = false)
    private User user;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ChatRoom getRoom() { return room; }
    public void setRoom(ChatRoom room) { this.room = room; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}