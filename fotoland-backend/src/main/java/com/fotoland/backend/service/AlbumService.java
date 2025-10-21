package com.fotoland.backend.service;

import com.fotoland.backend.model.Album;
import com.fotoland.backend.model.User;
import com.fotoland.backend.repository.AlbumRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final UserService userService;

    public AlbumService(AlbumRepository albumRepository, UserService userService) {
        this.albumRepository = albumRepository;
        this.userService = userService;
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
}
