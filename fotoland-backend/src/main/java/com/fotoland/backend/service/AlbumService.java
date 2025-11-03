package com.fotoland.backend.service;

import com.fotoland.backend.model.Album;
import com.fotoland.backend.model.User;
import com.fotoland.backend.repository.AlbumRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final UserService userService;

    @PersistenceContext
    private EntityManager entityManager;

    public AlbumService(AlbumRepository albumRepository, UserService userService) {
        this.albumRepository = albumRepository;
        this.userService = userService;
    }

    public Album createAlbum(Album album, String username) {
        User user = userService.findByUsername(username);
        album.setAuthor(user);
        return albumRepository.save(album);
    }

    public Page<Album> findAlbumsByUsername(String username, Pageable pageable) {
        User user = userService.findByUsername(username);
        return albumRepository.findByAuthor(user, pageable);
    }

    public Page<Album> findAllAlbums(Pageable pageable) {
        return albumRepository.findAll(pageable);
    }

    public Album findById(Long id) {
        return albumRepository.findById(id).orElseThrow(() -> new RuntimeException("Album not found"));
    }

    public Album updateAlbum(Long id, Album updated, String username) {
        Album existing = albumRepository.findById(id).orElseThrow(() -> new RuntimeException("Album not found"));
        if (!existing.getAuthor().getUsername().equals(username)) {
            throw new AccessDeniedException("User does not have permission to update this album");
        }
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setType(updated.getType());
        existing.setLocation(updated.getLocation());
        existing.setEventName(updated.getEventName());
        return albumRepository.save(existing);
    }

    @Transactional
    public void deleteAlbum(Long id, String username) {
        Album album = albumRepository.findById(id).orElseThrow(() -> new RuntimeException("Album not found"));
        if (!album.getAuthor().getUsername().equals(username)) {
            throw new AccessDeniedException("User does not have permission to delete this album");
        }
        // Use native queries to ensure deletion order and avoid JPA lifecycle issues
        entityManager.createNativeQuery("DELETE FROM comment WHERE post_id IN (SELECT id FROM post WHERE album_id = ?)")
            .setParameter(1, id)
            .executeUpdate();

        entityManager.createNativeQuery("DELETE FROM post WHERE album_id = ?")
            .setParameter(1, id)
            .executeUpdate();

        entityManager.createNativeQuery("DELETE FROM album WHERE id = ?")
            .setParameter(1, id)
            .executeUpdate();
    }
}
