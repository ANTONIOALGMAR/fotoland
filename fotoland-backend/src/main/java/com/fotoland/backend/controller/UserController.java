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
import com.fotoland.backend.dto.UserSummaryDTO;
import com.fotoland.backend.dto.UpdateProfileRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
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
    public ResponseEntity<List<UserSummaryDTO>> getOnlineFollowers(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        User currentUser = userService.findByUsername(authentication.getName());
        
        List<Follow> following = followRepository.findByFollowerId(currentUser.getId());
        
        List<UserSummaryDTO> online = following.stream()
                .map(Follow::getFollowing)
                .filter(u -> userStatusService.isOnline(u.getUsername()))
                .map(u -> UserSummaryDTO.from(u, true))
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(online);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserSummaryDTO>> searchUsers(@RequestParam String q) {
        String sanitizedQuery = q.replaceAll("[%_]", "").trim();
        if (sanitizedQuery.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        
        List<User> users = userService.searchUsers(sanitizedQuery);
        List<UserSummaryDTO> responses = users.stream()
                .map(u -> UserSummaryDTO.from(u, userStatusService.isOnline(u.getUsername())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserSummaryDTO>> getAllUsersSorted() {
        List<User> users = userService.findAllSorted();
        List<UserSummaryDTO> responses = users.stream()
                .map(u -> UserSummaryDTO.from(u, userStatusService.isOnline(u.getUsername())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        User user = userService.findByUsername(authentication.getName());
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(@Valid @RequestBody UpdateProfileRequest payload, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        
        User incoming = new User();
        incoming.setEmail(payload.getEmail());
        incoming.setFullName(payload.getFullName());
        incoming.setPhoneNumber(payload.getPhoneNumber());
        incoming.setAddress(payload.getAddress());
        incoming.setProfilePictureUrl(payload.getProfilePictureUrl());
        incoming.setState(payload.getState());
        incoming.setCountry(payload.getCountry());
        incoming.setZipCode(payload.getZipCode());

        User updated = userService.updateProfile(authentication.getName(), incoming);
        return ResponseEntity.ok(UserResponse.from(updated));
    }
}
