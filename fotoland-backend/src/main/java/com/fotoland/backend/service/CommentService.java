package com.fotoland.backend.service;

import com.fotoland.backend.model.Comment;
import com.fotoland.backend.model.Post;
import com.fotoland.backend.model.User;
import com.fotoland.backend.repository.CommentRepository;
import com.fotoland.backend.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserService userService;

    public CommentService(CommentRepository commentRepository, PostRepository postRepository, UserService userService) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userService = userService;
    }

    public List<Comment> getCommentsByPostId(Long postId) {
        return commentRepository.findByPostId(postId);
    }

    public Comment createComment(Long postId, String text, String username) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userService.findByUsername(username);
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(user);
        comment.setText(text);
        return commentRepository.save(comment);
    }

    public Comment updateComment(Long id, String text, String username) {
        Comment existing = commentRepository.findById(id).orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!existing.getAuthor().getUsername().equals(username)) {
            throw new RuntimeException("Forbidden: cannot edit another user's comment");
        }
        existing.setText(text);
        return commentRepository.save(existing);
    }

    public void deleteComment(Long id, String username) {
        Comment existing = commentRepository.findById(id).orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!existing.getAuthor().getUsername().equals(username)) {
            throw new RuntimeException("Forbidden: cannot delete another user's comment");
        }
        commentRepository.deleteById(id);
    }
}