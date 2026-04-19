package com.taiko.backend.service;

import com.taiko.backend.model.User;
import com.taiko.backend.model.UserProfileResponseDTO;
import com.taiko.backend.model.UserProfileUpdateDTO;
import com.taiko.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    /** Devuelve el perfil público del usuario identificado por email. */
    public UserProfileResponseDTO getUserProfile(String email) {
        User user = findByEmailOrThrow(email);
        return toDTO(user);
    }

    /** Actualiza nombre, teléfono o contraseña. La contraseña actual es requerida para cambiarla. */
    public UserProfileResponseDTO updateUserProfile(String email, UserProfileUpdateDTO dto) {
        User user = findByEmailOrThrow(email);

        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            user.setNombre(dto.getNombre().trim());
        }

        if (dto.getTelefono() != null) {
            user.setTelefono(dto.getTelefono().trim());
        }

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            if (dto.getPasswordActual() == null
                    || !passwordEncoder.matches(dto.getPasswordActual(), user.getPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña actual es incorrecta");
            }
            if (dto.getPassword().trim().length() < 8) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "La nueva contraseña debe tener al menos 8 caracteres");
            }
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return toDTO(userRepository.save(user));
    }

    private User findByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    private UserProfileResponseDTO toDTO(User user) {
        return new UserProfileResponseDTO(
                user.getNombre(), user.getEmail(), user.getTelefono(), user.getRol().name());
    }
}
