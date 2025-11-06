package com.fotoland.backend.repository;

import com.fotoland.backend.model.ChatRoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, Long> {
    List<ChatRoomMember> findByUser_Username(String username);
    boolean existsByRoom_IdAndUser_Id(Long roomId, Long userId);
    List<ChatRoomMember> findByRoom_Id(Long roomId);
}