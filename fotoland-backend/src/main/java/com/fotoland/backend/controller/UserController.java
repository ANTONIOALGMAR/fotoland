package com.fotoland.backend.controller;

import com.fotoland.backend.model.User;
import com.fotoland.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import com.fotoland.backend.dto.UserResponse;

import org.springframework.web.bind.annotation.*;
import com.fotoland.backend.dto.UserResponse;
import java.util.List;
import java.util.stream.Collectors;

import com.fotoland.backend.service.UserStatusService;
import com.fotoland.backend.repository.FollowRepository;
import com.fotoland.backend.model.Follow;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final UserStatusService userStatusService;
    private final FollowRepository followRepository;

    public UserController(UserService userService, UserStatusService userStatusService, FollowRepository followRepository) {
        this.userService = userService;
        this.userStatusService = userStatusService;
        this.followRepository = followRepository;
    }

    @GetMapping("/online-followers")
    public ResponseEntity<List<UserResponse>> getOnlineFollowers(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        User currentUser = userService.findByUsername(authentication.getName());
        
        // Pessoas que o usuário logado segue
        List<Follow> following = followRepository.findByFollowerId(currentUser.getId());
        
        List<UserResponse> online = following.stream()
                .map(Follow::getFollowing)
                .filter(u -> userStatusService.isOnline(u.getUsername()))
                .map(UserResponse::from)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(online);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String q) {
        List<User> users = userService.searchUsers(q);
        List<UserResponse> responses = users.stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        User user = userService.findByUsername(username);
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(@RequestBody User payload, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String username = authentication.getName();
        User updated = userService.updateProfile(username, payload);
        return ResponseEntity.ok(UserResponse.from(updated));
    }
}
