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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Para desarrollo
public class ChatController {

    @Autowired
    private ChatbotService chatbotService;

    @Autowired
    private UserRepository userRepository;

    // 1. Iniciar conversación (si hay JWT válido, se asocia al usuario)
    @PostMapping("/start")
    public ResponseEntity<Conversacion> startConversation() {
        User usuario = null;
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email != null && !"anonymousUser".equals(email)) {
            usuario = userRepository.findByEmail(email).orElse(null);
        }
        Conversacion nuevaConv = chatbotService.iniciarConversacion(usuario);
        return ResponseEntity.ok(nuevaConv);
    }

    // Mis conversaciones (autenticado)
    @GetMapping("/mis-conversaciones")
    public ResponseEntity<List<ConversacionResumenDTO>> misConversaciones() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(chatbotService.getMisConversaciones(email));
    }

    // Borrar una conversación propia (autenticado)
    @DeleteMapping("/conversaciones/{id}")
    public ResponseEntity<Void> deleteConversacion(@PathVariable UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        chatbotService.deleteConversacion(id, email);
        return ResponseEntity.noContent().build();
    }

    // 2. Enviar mensaje a la conversación
    @PostMapping("/{conversacionId}/message")
    public ResponseEntity<ChatResponseDTO> sendMessage(
            @PathVariable UUID conversacionId,
            @RequestBody ChatRequest request) {
        ChatResponseDTO response = chatbotService.enviarMensaje(conversacionId, request.getMensaje());
        return ResponseEntity.ok(response);
    }

    // 3. Recuperar historial (para cuando el frontend recarga la app)
    @GetMapping("/{conversacionId}/history")
    public ResponseEntity<List<MensajeConVehiculosDTO>> getHistory(@PathVariable UUID conversacionId) {
        return ResponseEntity.ok(chatbotService.obtenerHistorial(conversacionId));
    }

    // 4. Exportar historial a TXT
    @GetMapping("/{conversacionId}/export/txt")
    public ResponseEntity<byte[]> exportHistorialTxt(@PathVariable UUID conversacionId) {
        String contenido = chatbotService.exportConversacionToTxt(conversacionId);
        byte[] bytes = contenido.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "chat_export_" + conversacionId.toString().substring(0, 8) + ".txt");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }

    // 5. Exportar historial a JSON
    @GetMapping("/{conversacionId}/export/json")
    public ResponseEntity<byte[]> exportHistorialJson(@PathVariable UUID conversacionId) {
        String contenido = chatbotService.exportConversacionToJson(conversacionId);
        byte[] bytes = contenido.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setContentDispositionFormData("attachment", "chat_export_" + conversacionId.toString().substring(0, 8) + ".json");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }
}
