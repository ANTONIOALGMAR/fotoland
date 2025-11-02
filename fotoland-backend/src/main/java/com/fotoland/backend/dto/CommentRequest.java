package com.fotoland.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class CommentRequest {
    @NotBlank(message = "Comment text cannot be empty")
    private String text;

    // Getter
    public String getText() {
        return text;
    }

    // Setter
    public void setText(String text) {
        this.text = text;
    }
}