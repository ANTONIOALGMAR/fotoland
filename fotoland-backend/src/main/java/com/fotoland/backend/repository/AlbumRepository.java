package com.fotoland.backend.repository;

import com.fotoland.backend.model.Album;
import com.fotoland.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlbumRepository extends JpaRepository<Album, Long>, PagingAndSortingRepository<Album, Long> {
    Page<Album> findByAuthor(User author, Pageable pageable);
}
