package com.fotoland.backend.service;

import com.fotoland.backend.model.*;
import com.fotoland.backend.repository.FollowRepository;
import com.fotoland.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public FollowService(FollowRepository followRepository, UserRepository userRepository, NotificationService notificationService) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public void follow(String followerUsername, String followingUsername) {
        if (followerUsername.equals(followingUsername)) {
            throw new RuntimeException("You cannot follow yourself");
        }

        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new RuntimeException("Follower not found"));
        User following = userRepository.findByUsername(followingUsername)
                .orElseThrow(() -> new RuntimeException("User to follow not found"));

        if (!followRepository.existsByFollowerIdAndFollowingId(follower.getId(), following.getId())) {
            Follow follow = new Follow();
            follow.setFollower(follower);
            follow.setFollowing(following);
            followRepository.save(follow);

            // Notify followed user
            notificationService.notifyUser(followingUsername, Notification.Type.FOLLOW,
                    java.util.Map.of("followerUsername", followerUsername));
        }
    }

    @Transactional
    public void unfollow(String followerUsername, String followingUsername) {
        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new RuntimeException("Follower not found"));
        User following = userRepository.findByUsername(followingUsername)
                .orElseThrow(() -> new RuntimeException("User to unfollow not found"));

        followRepository.deleteByFollowerIdAndFollowingId(follower.getId(), following.getId());
    }

    public boolean isFollowing(String followerUsername, String followingUsername) {
        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new RuntimeException("Follower not found"));
        User following = userRepository.findByUsername(followingUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return followRepository.existsByFollowerIdAndFollowingId(follower.getId(), following.getId());
    }

    public Map<String, Long> getStats(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long followers = followRepository.countByFollowingId(user.getId());
        long following = followRepository.countByFollowerId(user.getId());

        return Map.of(
            "followersCount", followers,
            "followingCount", following
        );
    }
}
