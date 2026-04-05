package com.fotoland.backend.service;

import com.fotoland.backend.event.NotificationEvent;
import com.fotoland.backend.model.*;
import com.fotoland.backend.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserService userService;
    private final NotificationPublisher notificationPublisher;

    public CommentService(CommentRepository commentRepository,
                          PostRepository postRepository,
                          UserService userService,
                          NotificationPublisher notificationPublisher) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userService = userService;
        this.notificationPublisher = notificationPublisher;
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
        Comment saved = commentRepository.save(comment);

        // Notify post author
        if (!post.getAlbum().getAuthor().getUsername().equals(username)) {
            notificationPublisher.publish(new NotificationEvent(
                    post.getAlbum().getAuthor().getUsername(),
                    Notification.Type.POST_COMMENT,
                    java.util.Map.of("commenterUsername", username, "commentContent", text, "postId", postId)
            ));
        }

        return saved;
    }

    public Comment updateComment(Long id, String text, String username) {
        Comment existing = commentRepository.findById(id).orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!existing.getAuthor().getUsername().equals(username)) {
            throw new AccessDeniedException("User does not have permission to edit this comment");
        }
        existing.setText(text);
        return commentRepository.save(existing);
    }

    public void deleteComment(Long id, String username) {
        Comment existing = commentRepository.findById(id).orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!existing.getAuthor().getUsername().equals(username)) {
            throw new AccessDeniedException("User does not have permission to delete this comment");
        }
        commentRepository.deleteById(id);
    }
}
