package com.fotoland.backend.controller;

import com.fotoland.backend.model.Album;
import com.fotoland.backend.service.AlbumService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/albums")
public class AlbumController {

    private final AlbumService albumService;

    public AlbumController(AlbumService albumService) {
        this.albumService = albumService;
    }

    @PostMapping
    public ResponseEntity<Album> createAlbum(@RequestBody Album album, Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        Album createdAlbum = albumService.createAlbum(album, username);
        return new ResponseEntity<>(createdAlbum, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Album>> getMyAlbums(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        List<Album> albums = albumService.findAlbumsByUsername(username);
        return ResponseEntity.ok(albums);
    }

    @GetMapping
    public ResponseEntity<List<Album>> getAllAlbums() {
        List<Album> albums = albumService.findAllAlbums();
        return ResponseEntity.ok(albums);
    }

  @GetMapping("/{id}")
  public ResponseEntity<Album> getAlbumById(@PathVariable Long id) {
    Album album = albumService.findById(id);
    return ResponseEntity.ok(album);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Album> updateAlbum(@PathVariable Long id, @RequestBody Album album, Authentication authentication) {
    String username = authentication.getName();
    Album updated = albumService.updateAlbum(id, album, username);
    return ResponseEntity.ok(updated);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteAlbum(@PathVariable Long id, Authentication authentication) {
    String username = authentication.getName();
    albumService.deleteAlbum(id, username);
    return ResponseEntity.noContent().build();
  }
}
