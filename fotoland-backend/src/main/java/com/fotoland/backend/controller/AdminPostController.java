package com.fotoland.backend.controller;

import com.fotoland.backend.model.Post;
import com.fotoland.backend.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/posts")
public class AdminPostController {

    private final PostService postService;

    public AdminPostController(PostService postService) {
        this.postService = postService;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> adminUpdatePost(@PathVariable Long id, @RequestBody Post post) {
        Post updated = postService.adminUpdatePost(id, post);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> adminDeletePost(@PathVariable Long id) {
        postService.adminDeletePost(id);
        return ResponseEntity.noContent().build();
    }
}