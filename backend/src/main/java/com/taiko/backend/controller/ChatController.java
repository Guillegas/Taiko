package com.taiko.backend.controller;

import com.taiko.backend.model.ChatRequest;
import com.taiko.backend.model.ChatResponseDTO;
import com.taiko.backend.model.Conversacion;
import com.taiko.backend.model.ConversacionResumenDTO;
import com.taiko.backend.model.MensajeConVehiculosDTO;
import com.taiko.backend.model.User;
import com.taiko.backend.repository.UserRepository;
import com.taiko.backend.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private static final int MAX_MESSAGE_LENGTH = 2000;

    @Autowired private ChatbotService chatbotService;
    @Autowired private UserRepository userRepository;

    /**
     * Inicia una nueva conversación. Si hay JWT válido se asocia al usuario;
     * de lo contrario se crea como conversación anónima.
     */
    @PostMapping("/start")
    public ResponseEntity<Conversacion> startConversation() {
        User usuario = null;
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email != null && !"anonymousUser".equals(email)) {
            usuario = userRepository.findByEmail(email).orElse(null);
        }
        return ResponseEntity.ok(chatbotService.iniciarConversacion(usuario));
    }

    /** Envía un mensaje al chatbot y devuelve la respuesta del asistente. */
    @PostMapping("/{conversacionId}/message")
    public ResponseEntity<ChatResponseDTO> sendMessage(@PathVariable UUID conversacionId,
                                                       @RequestBody ChatRequest request) {
        if (request.getMensaje() == null || request.getMensaje().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El mensaje no puede estar vacío");
        }
        if (request.getMensaje().length() > MAX_MESSAGE_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El mensaje supera el límite de " + MAX_MESSAGE_LENGTH + " caracteres");
        }
        return ResponseEntity.ok(chatbotService.enviarMensaje(conversacionId, request.getMensaje()));
    }

    /** Devuelve el historial completo de mensajes de una conversación. */
    @GetMapping("/{conversacionId}/history")
    public ResponseEntity<List<MensajeConVehiculosDTO>> getHistory(@PathVariable UUID conversacionId) {
        return ResponseEntity.ok(chatbotService.obtenerHistorial(conversacionId));
    }

    /** Lista las conversaciones del usuario autenticado ordenadas por fecha. */
    @GetMapping("/mis-conversaciones")
    public ResponseEntity<List<ConversacionResumenDTO>> misConversaciones() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(chatbotService.getMisConversaciones(email));
    }

    /** Elimina una conversación propia. Verifica que pertenece al usuario autenticado. */
    @DeleteMapping("/conversaciones/{id}")
    public ResponseEntity<Void> deleteConversacion(@PathVariable UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        chatbotService.deleteConversacion(id, email);
        return ResponseEntity.noContent().build();
    }

    /** Exporta el historial de una conversación en formato TXT. */
    @GetMapping("/{conversacionId}/export/txt")
    public ResponseEntity<byte[]> exportTxt(@PathVariable UUID conversacionId) {
        byte[] bytes = chatbotService.exportConversacionToTxt(conversacionId)
                .getBytes(StandardCharsets.UTF_8);
        return buildDownloadResponse(bytes, MediaType.TEXT_PLAIN,
                "chat_" + conversacionId.toString().substring(0, 8) + ".txt");
    }

    /** Exporta el historial de una conversación en formato JSON. */
    @GetMapping("/{conversacionId}/export/json")
    public ResponseEntity<byte[]> exportJson(@PathVariable UUID conversacionId) {
        byte[] bytes = chatbotService.exportConversacionToJson(conversacionId)
                .getBytes(StandardCharsets.UTF_8);
        return buildDownloadResponse(bytes, MediaType.APPLICATION_JSON,
                "chat_" + conversacionId.toString().substring(0, 8) + ".json");
    }

    private ResponseEntity<byte[]> buildDownloadResponse(byte[] data, MediaType type, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(type);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setCacheControl("no-cache");
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }
}
