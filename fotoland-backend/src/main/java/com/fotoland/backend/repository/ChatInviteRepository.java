package com.fotoland.backend.repository;

import com.fotoland.backend.model.ChatInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatInviteRepository extends JpaRepository<ChatInvite, Long> {
}