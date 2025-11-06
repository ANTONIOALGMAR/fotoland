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
    private String email;    // novo
    private String state;    // novo
    private String country;  // novo
    private String zipCode;  // novo

    public UserResponse() {}

    public UserResponse(Long id, String username, String fullName, String phoneNumber, String address, String profilePictureUrl, String role, String email, String state, String country, String zipCode) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.profilePictureUrl = profilePictureUrl;
        this.role = role;
        this.email = email;
        this.state = state;
        this.country = country;
        this.zipCode = zipCode;
    }

    public static UserResponse from(User user) {
        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getFullName(),
            user.getPhoneNumber(),
            user.getAddress(),
            user.getProfilePictureUrl(),
            user.getRole(),
            user.getEmail(),
            user.getState(),
            user.getCountry(),
            user.getZipCode()
        );
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getFullName() { return fullName; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getAddress() { return address; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public String getRole() { return role; }
    public String getEmail() { return email; }         // novo
    public String getState() { return state; }         // novo
    public String getCountry() { return country; }     // novo
    public String getZipCode() { return zipCode; }     // novo

    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public void setAddress(String address) { this.address = address; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public void setRole(String role) { this.role = role; }
    public void setEmail(String email) { this.email = email; }       // novo
    public void setState(String state) { this.state = state; }       // novo
    public void setCountry(String country) { this.country = country; } // novo
}