package com.fotoland.backend.service;

import com.fotoland.backend.model.User;
import com.fotoland.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

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
        return userRepository.saveAndFlush(existing);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
