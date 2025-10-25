package com.fotoland.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    // Define the directory where files will be stored
    // IMPORTANT: In a production environment, this should be external storage (S3, GCS, etc.)
    // For local development, we'll use a directory within the project or a temp folder.
    private final String uploadDir = "uploads/"; // Relative to project root

    public FileUploadController() throws IOException {
        // Ensure the upload directory exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "File is empty"));
        }
        try {
            // Generate a unique file name to prevent conflicts
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir + fileName);

            // Save the file to the filesystem
            Files.copy(file.getInputStream(), filePath);

            // Construct the URL to access the file. This path must be configured as a static resource.
            String fileAccessUrl = "/uploads/" + fileName;

            // Return the URL in a JSON object
            Map<String, String> response = new HashMap<>();
            response.put("fileUrl", fileAccessUrl);

            return ResponseEntity.ok(response);
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Could not upload the file: " + ex.getMessage()));
        }
    }
}
