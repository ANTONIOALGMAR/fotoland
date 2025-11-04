package com.fotoland.backend.controller;

import com.fotoland.backend.model.Comment;
import com.fotoland.backend.dto.CommentRequest;
import com.fotoland.backend.service.CommentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {
    private final CommentService commentService;
    private final com.fotoland.backend.service.LikeService likeService;

    public CommentController(CommentService commentService, com.fotoland.backend.service.LikeService likeService) {
        this.commentService = commentService;
        this.likeService = likeService;
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPost(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPostId(postId));
    }

    @PostMapping("/post/{postId}")
    public ResponseEntity<Comment> createComment(@PathVariable Long postId,
                                                 @RequestBody CommentRequest commentRequest,
                                                 Authentication authentication) {
        String username = authentication.getName();
        Comment created = commentService.createComment(postId, commentRequest.getText(), username);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(@PathVariable Long id,
                                                 @RequestBody CommentRequest commentRequest,
                                                 Authentication authentication) {
        String username = authentication.getName();
        Comment updated = commentService.updateComment(id, commentRequest.getText(), username);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        commentService.deleteComment(id, username);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{commentId}/like")
    public ResponseEntity<java.util.Map<String, Long>> likeComment(@PathVariable Long commentId, Authentication authentication) {
        String username = authentication.getName();
        long count = likeService.likeComment(commentId, username);
        return ResponseEntity.ok(java.util.Map.of("likeCount", count));
    }

    @DeleteMapping("/{commentId}/like")
    public ResponseEntity<java.util.Map<String, Long>> unlikeComment(@PathVariable Long commentId, Authentication authentication) {
        String username = authentication.getName();
        long count = likeService.unlikeComment(commentId, username);
        return ResponseEntity.ok(java.util.Map.of("likeCount", count));
    }

    @GetMapping("/{commentId}/likes/count")
    public ResponseEntity<java.util.Map<String, Long>> getCommentLikes(@PathVariable Long commentId) {
        long count = likeService.getCommentLikes(commentId);
        return ResponseEntity.ok(java.util.Map.of("likeCount", count));
    }
}