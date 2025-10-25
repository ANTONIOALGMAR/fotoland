package com.fotoland.backend.service;

import com.fotoland.backend.model.Album;
import com.fotoland.backend.model.Post;
import com.fotoland.backend.repository.AlbumRepository;
import com.fotoland.backend.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final AlbumRepository albumRepository;

    public PostService(PostRepository postRepository, AlbumRepository albumRepository) {
        this.postRepository = postRepository;
        this.albumRepository = albumRepository;
    }

    public Post createPost(Post post, Long albumId) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new RuntimeException("Album not found"));
        post.setAlbum(album);
        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public List<Post> getPostsByAlbumId(Long albumId) {
        return postRepository.findByAlbumId(albumId);
    }

    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public Post updatePost(Long id, Post updatedPost) {
        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        existingPost.setCaption(updatedPost.getCaption());
        existingPost.setMediaUrl(updatedPost.getMediaUrl());
        existingPost.setType(updatedPost.getType());
        // Note: Album and createdAt are not updated here as they are typically immutable for a post

        return postRepository.save(existingPost);
    }

    public void deletePost(Long id) {
        if (!postRepository.existsById(id)) {
            throw new RuntimeException("Post not found");
        }
        postRepository.deleteById(id);
    }
}
