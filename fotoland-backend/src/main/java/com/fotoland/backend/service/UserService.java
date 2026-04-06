package com.fotoland.backend.service;

import com.fotoland.backend.model.User;
import com.fotoland.backend.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PostRepository postRepository;
    private final AlbumRepository albumRepository;
    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final PostLikeRepository postLikeRepository;
    private final FollowRepository followRepository;
    private final NotificationRepository notificationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final StoryRepository storyRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatInviteRepository chatInviteRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       PostRepository postRepository, AlbumRepository albumRepository,
                       CommentRepository commentRepository, CommentLikeRepository commentLikeRepository, PostLikeRepository postLikeRepository,
                       FollowRepository followRepository, NotificationRepository notificationRepository,
                       ChatMessageRepository chatMessageRepository, ChatRoomMemberRepository chatRoomMemberRepository,
                       StoryRepository storyRepository, ChatRoomRepository chatRoomRepository,
                       ChatInviteRepository chatInviteRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.postRepository = postRepository;
        this.albumRepository = albumRepository;
        this.commentRepository = commentRepository;
        this.commentLikeRepository = commentLikeRepository;
        this.postLikeRepository = postLikeRepository;
        this.followRepository = followRepository;
        this.notificationRepository = notificationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.chatRoomMemberRepository = chatRoomMemberRepository;
        this.storyRepository = storyRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.chatInviteRepository = chatInviteRepository;
    }

    public List<User> searchUsers(String query) {
        return userRepository.findByUsernameContainingIgnoreCaseOrFullNameContainingIgnoreCase(query, query);
    }

    public List<User> findAllSorted() {
        return userRepository.findAllByOrderByFullNameAsc();
    }

    @Transactional
    public User registerNewUser(User user) {
        if (user.getUsername() == null || user.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (user.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
        if (user.getFullName() == null || user.getFullName().isBlank()) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        String email = user.getEmail().trim();
        if (!email.contains("@") || !email.contains(".")) {
            throw new IllegalArgumentException("Invalid email");
        }
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        return userRepository.saveAndFlush(user);
    }

    public User updateProfile(String username, User incoming) {
        User existing = findByUsername(username);
        String newEmail = incoming.getEmail();
        if (newEmail != null && !newEmail.isBlank()) {
            String trimmed = newEmail.trim();
            if (!trimmed.contains("@") || !trimmed.contains(".")) {
                throw new IllegalArgumentException("Invalid email");
            }
            userRepository.findByEmail(trimmed).ifPresent(u -> {
                if (!u.getId().equals(existing.getId())) {
                    throw new RuntimeException("Email already exists");
                }
            });
            existing.setEmail(trimmed);
        }
        if (incoming.getFullName() != null) existing.setFullName(incoming.getFullName());
        if (incoming.getPhoneNumber() != null) existing.setPhoneNumber(incoming.getPhoneNumber());
        if (incoming.getAddress() != null) existing.setAddress(incoming.getAddress());
        if (incoming.getProfilePictureUrl() != null) existing.setProfilePictureUrl(incoming.getProfilePictureUrl());
        if (incoming.getState() != null) existing.setState(incoming.getState());
        if (incoming.getCountry() != null) existing.setCountry(incoming.getCountry());
        if (incoming.getZipCode() != null) existing.setZipCode(incoming.getZipCode());
        if (incoming.getHouseNumber() != null) existing.setHouseNumber(incoming.getHouseNumber());
        if (incoming.getComplement() != null) existing.setComplement(incoming.getComplement());
        return userRepository.saveAndFlush(existing);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Remove tudo que aponta para este usuário antes de deletá-lo
        postLikeRepository.deleteByUserId(user.getId());
        postRepository.deleteByAuthorId(user.getId());
        albumRepository.deleteByAuthorId(user.getId());
        commentRepository.deleteByAuthorId(user.getId());
        followRepository.deleteByFollowerId(user.getId());
        followRepository.deleteByFollowingId(user.getId());
        notificationRepository.deleteByUserId(user.getId());
        storyRepository.deleteByUserId(user.getId());
        commentLikeRepository.deleteByUserId(user.getId());
        chatMessageRepository.deleteBySenderUsername(user.getUsername());
        chatInviteRepository.deleteByInvitedUserId(user.getId());
        chatInviteRepository.deleteByInvitedById(user.getId());
        chatRoomMemberRepository.deleteByRoom_OwnerId(user.getId());
        chatRoomRepository.deleteByOwnerId(user.getId());
        chatRoomMemberRepository.deleteByUserId(user.getId());

        userRepository.delete(user);
    }
}
