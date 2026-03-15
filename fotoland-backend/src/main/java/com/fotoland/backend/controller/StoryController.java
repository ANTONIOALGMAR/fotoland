package com.fotoland.backend.controller;

import com.fotoland.backend.model.Story;
import com.fotoland.backend.model.User;
import com.fotoland.backend.repository.StoryRepository;
import com.fotoland.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/stories")
public class StoryController {

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Story> getActiveStories() {
        return storyRepository.findActiveStories(LocalDateTime.now());
    }

    @PostMapping
    public ResponseEntity<Story> postStory(@RequestBody Story story, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        story.setUser(user);
        story.setCreatedAt(LocalDateTime.now());
        story.setExpiresAt(LocalDateTime.now().plusHours(24));
        return ResponseEntity.ok(storyRepository.save(story));
    }
}
