package com.fotoland.backend.dto;

import com.fotoland.backend.model.User;

public class UserResponse {
    private Long id;
    private String username;
    private String fullName;
    private String phoneNumber;
    private String address;
    private String profilePictureUrl;
    private String role;

    public UserResponse() {}

    public UserResponse(Long id, String username, String fullName, String phoneNumber, String address, String profilePictureUrl, String role) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.profilePictureUrl = profilePictureUrl;
        this.role = role;
    }

    public static UserResponse from(User user) {
        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getFullName(),
            user.getPhoneNumber(),
            user.getAddress(),
            user.getProfilePictureUrl(),
            user.getRole()
        );
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getFullName() { return fullName; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getAddress() { return address; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public String getRole() { return role; }

    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public void setAddress(String address) { this.address = address; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public void setRole(String role) { this.role = role; }
}