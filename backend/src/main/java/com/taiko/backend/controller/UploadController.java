package com.taiko.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private static final String UPLOAD_DIR = "uploads";
    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    /**
     * Sube una imagen al servidor. Valida tipo MIME y tamaño antes de guardar.
     * Solo disponible para usuarios autenticados.
     */
    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El archivo está vacío"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Solo se permiten imágenes JPEG, PNG, WebP o GIF"));
        }

        if (file.getSize() > MAX_SIZE_BYTES) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "El archivo no puede superar los 5 MB"));
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath();
            Files.createDirectories(uploadPath);

            String extension = "";
            String originalName = file.getOriginalFilename();
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }

            // UUID como nombre para evitar colisiones y no exponer rutas predecibles
            String fileName = UUID.randomUUID() + extension;
            Files.write(uploadPath.resolve(fileName), file.getBytes());

            return ResponseEntity.ok(Map.of("url", baseUrl + "/uploads/" + fileName));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error al subir la imagen"));
        }
    }
}
