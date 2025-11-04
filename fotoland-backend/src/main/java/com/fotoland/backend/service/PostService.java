package com.fotoland.backend.service;

import com.fotoland.backend.model.Album;
import com.fotoland.backend.model.Post;
import com.fotoland.backend.repository.AlbumRepository;
import com.fotoland.backend.repository.PostRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final AlbumRepository albumRepository;

    public PostService(PostRepository postRepository, AlbumRepository albumRepository) {
        this.postRepository = postRepository;
        this.albumRepository = albumRepository;
    }

    public Post createPost(Post post, Long albumId, String username) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new RuntimeException("Album not found"));
        // Security Check: Ensure the user owns the album they are posting to.
        if (!album.getAuthor().getUsername().equals(username)) {
            throw new AccessDeniedException("User does not have permission to post in this album");
        }
        post.setAlbum(album);
        return postRepository.save(post);
    }

    public Page<Post> getAllPosts(Pageable pageable) {
        return postRepository.findAll(pageable);
    }

    public Page<Post> getPostsByAlbumId(Long albumId, Pageable pageable) {
        return postRepository.findByAlbumId(albumId, pageable);
    }

    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public Post updatePost(Long id, Post updatedPost, String username) {
        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Security Check: Ensure the user owns the post.
        if (!existingPost.getAlbum().getAuthor().getUsername().equals(username)) {
            throw new AccessDeniedException("User does not have permission to update this post");
        }

        existingPost.setCaption(updatedPost.getCaption());
        existingPost.setMediaUrl(updatedPost.getMediaUrl());
        existingPost.setType(updatedPost.getType());
        // Note: Album and createdAt are not updated here as they are typically immutable for a post

        return postRepository.save(existingPost);
    }

    public void deletePost(Long id, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        // Security Check: Ensure the user owns the post.
        if (!post.getAlbum().getAuthor().getUsername().equals(username)) {
            throw new AccessDeniedException("User does not have permission to delete this post");
        }
        postRepository.delete(post);
    }

    // Métodos ADMIN sem verificar o autor do post
    public Post adminUpdatePost(Long id, Post updatedPost) {
        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        existingPost.setCaption(updatedPost.getCaption());
        existingPost.setMediaUrl(updatedPost.getMediaUrl());
        existingPost.setType(updatedPost.getType());
        return postRepository.save(existingPost);
    }

    public void adminDeletePost(Long id) {
        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        postRepository.delete(existingPost);
    }
}
