package com.fotoland.backend.repository;

import com.fotoland.backend.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUser_Username(String username, Pageable pageable);
    Page<Notification> findByUser_UsernameAndReadAtIsNull(String username, Pageable pageable);
}