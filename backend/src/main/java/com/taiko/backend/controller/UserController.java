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
public class UserController {

    @Autowired
    private UserService userService;

    /** Devuelve el perfil del usuario autenticado. */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> getMyProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(userService.getUserProfile(email));
    }

    /** Actualiza nombre, teléfono o contraseña del usuario autenticado. */
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> updateMyProfile(@RequestBody UserProfileUpdateDTO updateDTO) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(userService.updateUserProfile(email, updateDTO));
    }
}
