package com.fotoland.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String fullName;
    
    @Email(message = "Invalid email format")
    private String email;
    
    private String phoneNumber;
    private String address;
    private String profilePictureUrl;
    private String state;
    private String country;
    private String zipCode;
}
