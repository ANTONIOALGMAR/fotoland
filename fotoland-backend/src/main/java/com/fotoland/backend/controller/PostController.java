package com.fotoland.backend.controller;

import com.fotoland.backend.model.Post;
import com.fotoland.backend.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping("/album/{albumId}")
    public ResponseEntity<Post> createPost(@PathVariable Long albumId, @RequestBody Post post, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        // In a real app, you'd verify the authenticated user owns the albumId
        // For now, we'll trust the albumId
        Post createdPost = postService.createPost(post, albumId);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }
}
