package com.fotoland.backend.dto;

import com.fotoland.backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDTO {
    private Long id;
    private String username;
    private String fullName;
    private String profilePictureUrl;
    private boolean online;

    public static UserSummaryDTO from(User user, boolean online) {
        return new UserSummaryDTO(
            user.getId(),
            user.getUsername(),
            user.getFullName(),
            user.getProfilePictureUrl(),
            online
        );
    }
}
