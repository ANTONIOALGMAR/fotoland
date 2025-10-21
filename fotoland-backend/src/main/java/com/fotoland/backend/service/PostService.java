package com.fotoland.backend.service;

import com.fotoland.backend.model.Album;
import com.fotoland.backend.model.Post;
import com.fotoland.backend.repository.AlbumRepository;
import com.fotoland.backend.repository.PostRepository;
import org.springframework.stereotype.Service;

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
}
