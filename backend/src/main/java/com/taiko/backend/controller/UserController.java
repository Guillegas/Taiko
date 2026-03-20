package com.taiko.backend.controller;

import com.taiko.backend.model.UserProfileResponseDTO;
import com.taiko.backend.model.UserProfileUpdateDTO;
import com.taiko.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Para desarrollo FrontEnd
public class UserController {

    @Autowired
    private UserService userService;

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/users/me
    // Devuelve los datos del usuario logueado usando el token JWT
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> getMyProfile() {
        // Extraer el email (username) del Authentication Token
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(userService.getUserProfile(email));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/users/me
    // Actualiza los datos permitidos del usuario logueado
    // ─────────────────────────────────────────────────────────────────────────
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> updateMyProfile(
            @RequestBody UserProfileUpdateDTO updateDTO) {
                
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(userService.updateUserProfile(email, updateDTO));
    }
}
