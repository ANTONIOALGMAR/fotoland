package com.fotoland.backend.repository;

import com.fotoland.backend.model.Album;
import com.fotoland.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {
    List<Album> findByAuthor(User author);
}
