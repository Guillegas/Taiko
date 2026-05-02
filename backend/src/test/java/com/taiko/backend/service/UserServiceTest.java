package com.taiko.backend.service;

import com.taiko.backend.model.User;
import com.taiko.backend.model.UserProfileResponseDTO;
import com.taiko.backend.model.UserProfileUpdateDTO;
import com.taiko.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setNombre("Guillermo");
        user.setEmail("test@test.com");
        user.setTelefono("600000000");
        user.setPassword("hashed_password");
        user.setRol(User.RolUsuario.cliente);
    }

    @Test
    void getUserProfile_found_returnsDTO() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        UserProfileResponseDTO result = userService.getUserProfile("test@test.com");

        assertThat(result.getNombre()).isEqualTo("Guillermo");
        assertThat(result.getEmail()).isEqualTo("test@test.com");
    }

    @Test
    void getUserProfile_notFound_throws404() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserProfile("unknown@test.com"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void updateProfile_updatesNombre() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserProfileUpdateDTO dto = new UserProfileUpdateDTO();
        dto.setNombre("Nuevo Nombre");

        userService.updateUserProfile("test@test.com", dto);

        assertThat(user.getNombre()).isEqualTo("Nuevo Nombre");
        verify(userRepository).save(user);
    }

    @Test
    void updateProfile_changePassword_correctCurrent_updatesHash() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass_actual", "hashed_password")).thenReturn(true);
        when(passwordEncoder.encode("nueva_pass_segura")).thenReturn("nuevo_hash");
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserProfileUpdateDTO dto = new UserProfileUpdateDTO();
        dto.setPassword("nueva_pass_segura");
        dto.setPasswordActual("pass_actual");

        userService.updateUserProfile("test@test.com", dto);

        assertThat(user.getPassword()).isEqualTo("nuevo_hash");
    }

    @Test
    void updateProfile_changePassword_wrongCurrent_throws400() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass_incorrecta", "hashed_password")).thenReturn(false);

        UserProfileUpdateDTO dto = new UserProfileUpdateDTO();
        dto.setPassword("nueva_pass_segura");
        dto.setPasswordActual("pass_incorrecta");

        assertThatThrownBy(() -> userService.updateUserProfile("test@test.com", dto))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void updateProfile_changePassword_tooShort_throws400() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass_actual", "hashed_password")).thenReturn(true);

        UserProfileUpdateDTO dto = new UserProfileUpdateDTO();
        dto.setPassword("corta");
        dto.setPasswordActual("pass_actual");

        assertThatThrownBy(() -> userService.updateUserProfile("test@test.com", dto))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }
}
