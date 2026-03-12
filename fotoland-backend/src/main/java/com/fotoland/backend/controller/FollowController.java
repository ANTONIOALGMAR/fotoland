package com.fotoland.backend.controller;

import com.fotoland.backend.service.FollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @PostMapping("/{username}/follow")
    public ResponseEntity<Void> follow(@PathVariable String username, Authentication authentication) {
        followService.follow(authentication.getName(), username);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{username}/unfollow")
    public ResponseEntity<Void> unfollow(@PathVariable String username, Authentication authentication) {
        followService.unfollow(authentication.getName(), username);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{username}/is-following")
    public ResponseEntity<Map<String, Boolean>> isFollowing(@PathVariable String username, Authentication authentication) {
        boolean isFollowing = followService.isFollowing(authentication.getName(), username);
        return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    }

    @GetMapping("/{username}/follow-stats")
    public ResponseEntity<Map<String, Long>> getStats(@PathVariable String username) {
        return ResponseEntity.ok(followService.getStats(username));
    }
}
