package com.fotoland.backend.repository;

import com.fotoland.backend.model.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {
    // Últimas 50 mensagens em ordem cronológica
    List<ChatMessageEntity> findTop50ByRoom_IdOrderByCreatedAtAsc(Long roomId);
}