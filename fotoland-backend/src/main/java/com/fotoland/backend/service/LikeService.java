package com.fotoland.backend.service;

import com.fotoland.backend.model.*;
import com.fotoland.backend.repository.*;
import org.springframework.stereotype.Service;

@Service
public class LikeService {

    private final PostLikeRepository postLikeRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserService userService;

    public LikeService(PostLikeRepository postLikeRepository,
                       CommentLikeRepository commentLikeRepository,
                       PostRepository postRepository,
                       CommentRepository commentRepository,
                       UserService userService) {
        this.postLikeRepository = postLikeRepository;
        this.commentLikeRepository = commentLikeRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.userService = userService;
    }

    // Post likes
    public long likePost(Long postId, String username) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userService.findByUsername(username);

        if (!postLikeRepository.existsByPostIdAndUserId(postId, user.getId())) {
            PostLike like = new PostLike();
            like.setPost(post);
            like.setUser(user);
            postLikeRepository.save(like);
        }
        return postLikeRepository.countByPostId(postId);
    }

    public long unlikePost(Long postId, String username) {
        User user = userService.findByUsername(username);
        postLikeRepository.deleteByPostIdAndUserId(postId, user.getId());
        return postLikeRepository.countByPostId(postId);
    }

    public long getPostLikes(Long postId) {
        return postLikeRepository.countByPostId(postId);
    }

    // Comment likes
    public long likeComment(Long commentId, String username) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        User user = userService.findByUsername(username);

        if (!commentLikeRepository.existsByCommentIdAndUserId(commentId, user.getId())) {
            CommentLike like = new CommentLike();
            like.setComment(comment);
            like.setUser(user);
            commentLikeRepository.save(like);
        }
        return commentLikeRepository.countByCommentId(commentId);
    }

    public long unlikeComment(Long commentId, String username) {
        User user = userService.findByUsername(username);
        commentLikeRepository.deleteByCommentIdAndUserId(commentId, user.getId());
        return commentLikeRepository.countByCommentId(commentId);
    }

    public long getCommentLikes(Long commentId) {
        return commentLikeRepository.countByCommentId(commentId);
    }
}