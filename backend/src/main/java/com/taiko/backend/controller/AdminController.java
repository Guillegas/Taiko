package com.taiko.backend.controller;

import com.taiko.backend.model.AdminUserDTO;
import com.taiko.backend.model.AdminUserUpdateRequest;
import com.taiko.backend.model.User;
import com.taiko.backend.repository.ConversacionRepository;
import com.taiko.backend.repository.MensajeRepository;
import com.taiko.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConversacionRepository conversacionRepository;

    @Autowired
    private MensajeRepository mensajeRepository;

    private void verificarAdmin() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        if (admin.getRol() != User.RolUsuario.admin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo los administradores pueden acceder a este recurso");
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDTO>> getAllUsers() {
        verificarAdmin();
        List<AdminUserDTO> users = userRepository.findAll().stream()
                .map(u -> new AdminUserDTO(u.getId(), u.getNombre(), u.getEmail(), u.getTelefono(), u.getRol().name(), u.isActivo()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<AdminUserDTO> updateUser(@PathVariable UUID id, @RequestBody AdminUserUpdateRequest request) {
        verificarAdmin();
        String emailActual = SecurityContextHolder.getContext().getAuthentication().getName();

        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (request.getNombre() != null && !request.getNombre().isBlank()) {
            target.setNombre(request.getNombre());
        }
        if (request.getTelefono() != null) {
            target.setTelefono(request.getTelefono());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank() && !request.getEmail().equals(target.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya está en uso");
            }
            target.setEmail(request.getEmail());
        }

        boolean esPropioAdmin = target.getEmail().equals(emailActual);

        if (request.getActivo() != null && !esPropioAdmin) {
            target.setActivo(request.getActivo());
        }

        userRepository.save(target);

        if (request.getRol() != null && !esPropioAdmin) {
            if (!request.getRol().equals("admin") && !request.getRol().equals("cliente")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol inválido");
            }
            userRepository.updateRol(id, request.getRol());
        }

        User updated = userRepository.findById(id).orElseThrow();
        return ResponseEntity.ok(new AdminUserDTO(updated.getId(), updated.getNombre(), updated.getEmail(), updated.getTelefono(), updated.getRol().name(), updated.isActivo()));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        verificarAdmin();
        String emailActual = SecurityContextHolder.getContext().getAuthentication().getName();
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (target.getEmail().equals(emailActual)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes eliminar tu propia cuenta desde el panel");
        }
        // Desasociar conversaciones del usuario antes de borrar
        conversacionRepository.findByUsuarioId(id).forEach(conv -> {
            conv.setUsuario(null);
            conversacionRepository.save(conv);
        });
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
