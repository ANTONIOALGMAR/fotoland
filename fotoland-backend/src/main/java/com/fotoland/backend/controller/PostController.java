package com.fotoland.backend.controller;

import com.fotoland.backend.model.Post;
import com.fotoland.backend.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postService.getAllPosts();
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    @GetMapping("/album/{albumId}")
    public ResponseEntity<List<Post>> getPostsByAlbumId(@PathVariable Long albumId) {
        List<Post> posts = postService.getPostsByAlbumId(albumId);
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        Post post = postService.getPostById(id);
        return new ResponseEntity<>(post, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestBody Post post, Authentication authentication) {
        // Authorization should be handled in the service layer
        String username = authentication.getName();
        Post updatedPost = postService.updatePost(id, post, username);
        return new ResponseEntity<>(updatedPost, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, Authentication authentication) {
        // Authorization should be handled in the service layer
        String username = authentication.getName();
        postService.deletePost(id, username);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/album/{albumId}")
    public ResponseEntity<Post> createPost(@PathVariable Long albumId, @RequestBody Post post, Authentication authentication) {
        String username = authentication.getName();
        Post createdPost = postService.createPost(post, albumId, username);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }
}
