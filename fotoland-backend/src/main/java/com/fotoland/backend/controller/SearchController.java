package com.fotoland.backend.controller;

import com.fotoland.backend.model.Post;
import com.fotoland.backend.model.PostType;
import com.fotoland.backend.repository.PostRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final PostRepository postRepository;

    public SearchController(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @GetMapping("/posts")
    public ResponseEntity<Page<Post>> searchPosts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) PostType type,
            @RequestParam(required = false) Long albumId,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String createdFrom,
            @RequestParam(required = false) String createdTo,
            Pageable pageable
    ) {
        Specification<Post> spec = Specification.where(null);

        if (q != null && !q.isBlank()) {
            String like = "%" + q.toLowerCase().trim() + "%";
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("caption")), like));
        }
        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), type));
        }
        if (albumId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("album").get("id"), albumId));
        }
        if (author != null && !author.isBlank()) {
            String authorLike = "%" + author.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                cb.like(cb.lower(root.get("album").get("author").get("username")), authorLike)
            );
        }
        try {
            if (createdFrom != null && !createdFrom.isBlank()) {
                java.time.LocalDateTime from = java.time.LocalDateTime.parse(createdFrom);
                spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }
            if (createdTo != null && !createdTo.isBlank()) {
                java.time.LocalDateTime to = java.time.LocalDateTime.parse(createdTo);
                spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), to));
            }
        } catch (Exception ignored) {}
        Page<Post> page = postRepository.findAll(spec, pageable);
        return ResponseEntity.ok(page);
    }
}