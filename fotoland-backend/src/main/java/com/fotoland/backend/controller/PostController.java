package com.fotoland.backend.controller;

import com.fotoland.backend.model.Post;
import com.fotoland.backend.service.PostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final com.fotoland.backend.service.LikeService likeService;

    public PostController(PostService postService, com.fotoland.backend.service.LikeService likeService) {
        this.postService = postService;
        this.likeService = likeService;
    }

    @GetMapping
    public ResponseEntity<Page<Post>> getAllPosts(Pageable pageable) {
        Page<Post> posts = postService.getAllPosts(pageable);
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    @GetMapping("/album/{albumId}")
    public ResponseEntity<Page<Post>> getPostsByAlbumId(@PathVariable Long albumId, Pageable pageable) {
        Page<Post> posts = postService.getPostsByAlbumId(albumId, pageable);
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

    @PostMapping("/{postId}/like")
    public ResponseEntity<java.util.Map<String, Long>> likePost(@PathVariable Long postId, Authentication authentication) {
        String username = authentication.getName();
        long count = likeService.likePost(postId, username);
        return ResponseEntity.ok(java.util.Map.of("likeCount", count));
    }

    @DeleteMapping("/{postId}/like")
    public ResponseEntity<java.util.Map<String, Long>> unlikePost(@PathVariable Long postId, Authentication authentication) {
        String username = authentication.getName();
        long count = likeService.unlikePost(postId, username);
        return ResponseEntity.ok(java.util.Map.of("likeCount", count));
    }

    @GetMapping("/{postId}/likes/count")
    public ResponseEntity<java.util.Map<String, Long>> getPostLikes(@PathVariable Long postId) {
        long count = likeService.getPostLikes(postId);
        return ResponseEntity.ok(java.util.Map.of("likeCount", count));
    }
}
