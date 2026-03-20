package com.taiko.backend.service;

import com.taiko.backend.model.User;
import com.taiko.backend.model.UserProfileResponseDTO;
import com.taiko.backend.model.UserProfileUpdateDTO;
import com.taiko.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserProfileResponseDTO getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        return new UserProfileResponseDTO(
                user.getNombre(),
                user.getEmail(),
                user.getTelefono(),
                user.getRol().name()
        );
    }

    public UserProfileResponseDTO updateUserProfile(String email, UserProfileUpdateDTO updateDTO) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (updateDTO.getNombre() != null && !updateDTO.getNombre().trim().isEmpty()) {
            user.setNombre(updateDTO.getNombre().trim());
        }

        if (updateDTO.getTelefono() != null) {
            user.setTelefono(updateDTO.getTelefono().trim());
        }

        if (updateDTO.getPassword() != null && !updateDTO.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updateDTO.getPassword()));
        }

        User updatedUser = userRepository.save(user);

        return new UserProfileResponseDTO(
                updatedUser.getNombre(),
                updatedUser.getEmail(),
                updatedUser.getTelefono(),
                updatedUser.getRol().name()
        );
    }
}
