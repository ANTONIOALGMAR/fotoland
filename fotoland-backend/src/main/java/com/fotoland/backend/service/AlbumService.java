package com.fotoland.backend.service;

import com.fotoland.backend.model.Album;
import com.fotoland.backend.model.Post;
import com.fotoland.backend.model.User;
import com.fotoland.backend.repository.AlbumRepository;
import com.fotoland.backend.repository.CommentRepository;
import com.fotoland.backend.repository.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final UserService userService;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    public AlbumService(AlbumRepository albumRepository, UserService userService, PostRepository postRepository, CommentRepository commentRepository) {
        this.albumRepository = albumRepository;
        this.userService = userService;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
    }

    public Album createAlbum(Album album, String username) {
        User user = userService.findByUsername(username);
        album.setAuthor(user);
        return albumRepository.save(album);
    }

    public List<Album> findAlbumsByUsername(String username) {
        User user = userService.findByUsername(username);
        return albumRepository.findByAuthor(user);
    }

    public List<Album> findAllAlbums() {
        return albumRepository.findAll();
    }

    public Album findById(Long id) {
        return albumRepository.findById(id).orElseThrow(() -> new RuntimeException("Album not found"));
    }

    public Album updateAlbum(Long id, Album updated) {
        Album existing = albumRepository.findById(id).orElseThrow(() -> new RuntimeException("Album not found"));
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setType(updated.getType());
        existing.setLocation(updated.getLocation());
        existing.setEventName(updated.getEventName());
        return albumRepository.save(existing);
    }

    @Transactional
    public void deleteAlbum(Long id) {
        Album album = albumRepository.findById(id).orElseThrow(() -> new RuntimeException("Album not found with id: " + id));

        // 1. Obter todas as postagens do álbum
        List<Post> posts = postRepository.findByAlbumId(id);

        // 2. Para cada postagem, excluir os comentários associados
        for (Post post : posts) {
            commentRepository.deleteAll(commentRepository.findByPostId(post.getId()));
        }

        // 3. Excluir todas as postagens do álbum
        postRepository.deleteAll(posts);

        // 4. Finalmente, excluir o álbum
        albumRepository.delete(album);
    }
}
