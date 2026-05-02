package com.taiko.backend.service;

import com.taiko.backend.model.Conversacion;
import com.taiko.backend.model.EmisorMensaje;
import com.taiko.backend.model.Mensaje;
import com.taiko.backend.model.User;
import com.taiko.backend.repository.ConversacionRepository;
import com.taiko.backend.repository.MensajeRepository;
import com.taiko.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatbotServiceTest {

    @Mock private ConversacionRepository conversacionRepository;
    @Mock private MensajeRepository mensajeRepository;
    @Mock private ChatModel chatModel;
    @Mock private VehiculoService vehiculoService;
    @Mock private UserRepository userRepository;
    @Mock private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @InjectMocks
    private ChatbotService chatbotService;

    private User user;
    private UUID userId;
    private UUID convId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        convId = UUID.randomUUID();

        user = new User();
        user.setId(userId);
        user.setEmail("test@test.com");
        user.setNombre("Guillermo");
        user.setRol(User.RolUsuario.cliente);
    }

    @Test
    void iniciarConversacion_anonima_setsWebCanal() {
        Conversacion saved = new Conversacion();
        saved.setCanal("web");
        when(conversacionRepository.save(any(Conversacion.class))).thenReturn(saved);

        Conversacion result = chatbotService.iniciarConversacion();

        assertThat(result.getCanal()).isEqualTo("web");
        assertThat(result.getUsuario()).isNull();
    }

    @Test
    void iniciarConversacion_conUsuario_vinculaUsuario() {
        Conversacion saved = new Conversacion();
        saved.setCanal("web");
        saved.setUsuario(user);
        when(conversacionRepository.save(any(Conversacion.class))).thenReturn(saved);

        Conversacion result = chatbotService.iniciarConversacion(user);

        assertThat(result.getUsuario()).isEqualTo(user);
    }

    @Test
    void getMisConversaciones_userNotFound_throws404() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> chatbotService.getMisConversaciones("unknown@test.com"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void getMisConversaciones_returnsEmptyWhenNoConversaciones() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(conversacionRepository.findByUsuarioIdOrderByFechaInicioDesc(userId))
                .thenReturn(List.of());

        var result = chatbotService.getMisConversaciones("test@test.com");

        assertThat(result).isEmpty();
    }

    @Test
    void deleteConversacion_userNotFound_throws404() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> chatbotService.deleteConversacion(convId, "unknown@test.com"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void deleteConversacion_convNotFound_throws404() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(conversacionRepository.findByIdAndUsuarioId(convId, userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> chatbotService.deleteConversacion(convId, "test@test.com"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void deleteConversacion_found_deletesMessagesAndConversacion() {
        Conversacion conv = new Conversacion();
        conv.setId(convId);
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(conversacionRepository.findByIdAndUsuarioId(convId, userId))
                .thenReturn(Optional.of(conv));

        chatbotService.deleteConversacion(convId, "test@test.com");

        verify(mensajeRepository).deleteByConversacionId(convId);
        verify(conversacionRepository).deleteById(convId);
    }

    @Test
    void exportConversacionToTxt_containsConversacionId() {
        when(mensajeRepository.findByConversacionIdOrderByFechaEnvioAsc(convId))
                .thenReturn(List.of());

        String result = chatbotService.exportConversacionToTxt(convId);

        assertThat(result).contains(convId.toString());
        assertThat(result).contains("Taiko Motors");
    }
}
