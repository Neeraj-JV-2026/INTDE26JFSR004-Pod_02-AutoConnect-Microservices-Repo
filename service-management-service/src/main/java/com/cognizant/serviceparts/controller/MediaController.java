package com.cognizant.serviceparts.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

@RestController
@RequestMapping("/api/service/media")
@Slf4j
public class MediaController {

    /**
     * Enterprise Media Handler
     * In a production environment, this would upload to AWS S3 or Azure Blob Storage.
     * For this implementation, we simulate the upload and return a virtual URI.
     */
    @PostMapping("/upload")
    public ResponseEntity<MediaResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        log.info("Received upload request for file: {}", file.getOriginalFilename());

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Simulate storage logic
        String fileExtension = getFileExtension(file.getOriginalFilename());
        String virtualPath = "/media/uploads/" + UUID.randomUUID().toString() + fileExtension;

        log.info("File successfully 'stored' at virtual path: {}", virtualPath);

        return ResponseEntity.ok(new MediaResponse(virtualPath, file.getOriginalFilename(), file.getSize()));
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return "";
        return fileName.substring(fileName.lastIndexOf("."));
    }

    public record MediaResponse(String uri, String originalName, long size) {}
}
