package com.taiko.backend.controller;

import com.taiko.backend.model.Conversacion;
import com.taiko.backend.model.Mensaje;
import com.taiko.backend.model.ChatRequest;
import com.taiko.backend.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Para desarrollo
public class ChatController {

    @Autowired
    private ChatbotService chatbotService;

    // 1. Iniciar conversación
    @PostMapping("/start")
    public ResponseEntity<Conversacion> startConversation() {
        Conversacion nuevaConv = chatbotService.iniciarConversacion();
        return ResponseEntity.ok(nuevaConv);
    }

    // 2. Enviar mensaje a la conversación
    @PostMapping("/{conversacionId}/message")
    public ResponseEntity<Map<String, String>> sendMessage(
            @PathVariable UUID conversacionId,
            @RequestBody ChatRequest request) {
        
        String respuestaIA = chatbotService.enviarMensaje(conversacionId, request.getMensaje());
        
        Map<String, String> response = new HashMap<>();
        response.put("respuesta", respuestaIA);
        
        return ResponseEntity.ok(response);
    }

    // 3. Recuperar historial (para cuando el frontend recarga la app)
    @GetMapping("/{conversacionId}/history")
    public ResponseEntity<List<Mensaje>> getHistory(@PathVariable UUID conversacionId) {
        List<Mensaje> historial = chatbotService.obtenerHistorial(conversacionId);
        return ResponseEntity.ok(historial);
    }

    // 4. Exportar historial a TXT
    @GetMapping("/{conversacionId}/export/txt")
    public ResponseEntity<byte[]> exportHistorialTxt(@PathVariable UUID conversacionId) {
        String contenido = chatbotService.exportConversacionToTxt(conversacionId);
        
        byte[] bytes = contenido.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        // Fuerza la descarga del archivo con un nombre predeterminado
        headers.setContentDispositionFormData("attachment", "chat_export_" + conversacionId.toString().substring(0, 8) + ".txt");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }
}
