package com.fotoland.backend.repository;

import com.fotoland.backend.model.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {
    
    @Query("SELECT s FROM Story s WHERE s.expiresAt > :now ORDER BY s.createdAt DESC")
    List<Story> findActiveStories(LocalDateTime now);
    
    List<Story> findByUserIdAndExpiresAtAfter(Long userId, LocalDateTime now);

    void deleteByUserId(Long userId);
}
