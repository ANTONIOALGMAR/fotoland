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

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
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
}