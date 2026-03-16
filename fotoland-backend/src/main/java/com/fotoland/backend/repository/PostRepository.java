package com.fotoland.backend.repository;

import com.fotoland.backend.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Post> {
    Page<Post> findByAlbumId(Long albumId, Pageable pageable);

    @Modifying
    @Query("delete from Post p where p.album.author.id = :authorId")
    void deleteByAuthorId(@Param("authorId") Long authorId);
}
