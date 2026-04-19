package com.taiko.backend.controller;

import com.taiko.backend.model.ChatResponseDTO;
import com.taiko.backend.model.Conversacion;
import com.taiko.backend.model.Vehiculo;
import com.taiko.backend.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/webhook/telegram")
public class TelegramWebhookController {

    @Value("${telegram.bot.token:}")
    private String botToken;

    @Autowired
    private ChatbotService chatbotService;

    private final RestTemplate restTemplate = new RestTemplate();

    // Mapea chat_id de Telegram → conversacionId de nuestra BD
    private final Map<Long, UUID> sesiones = new ConcurrentHashMap<>();

    @PostMapping
    public ResponseEntity<Void> handleUpdate(@RequestBody Map<String, Object> update) {
        try {
            // Telegram envía el mensaje dentro de "message"
            @SuppressWarnings("unchecked")
            Map<String, Object> message = (Map<String, Object>) update.get("message");
            if (message == null) return ResponseEntity.ok().build();

            @SuppressWarnings("unchecked")
            Map<String, Object> chat = (Map<String, Object>) message.get("chat");
            if (chat == null) return ResponseEntity.ok().build();

            Long chatId = ((Number) chat.get("id")).longValue();
            String texto = (String) message.get("text");

            if (texto == null || texto.isBlank()) return ResponseEntity.ok().build();

            // Comandos especiales
            if ("/start".equals(texto) || "/nuevo".equals(texto)) {
                sesiones.remove(chatId);
                sendMessage(chatId, "👋 ¡Hola\\! Soy el asistente de *Taiko Motors*\\. Estoy conectado al inventario en tiempo real\\. ¿En qué puedo ayudarte para encontrar tu coche ideal?");
                return ResponseEntity.ok().build();
            }

            // Obtener o crear conversación para este chat
            UUID convId = sesiones.computeIfAbsent(chatId, id -> {
                Conversacion conv = chatbotService.iniciarConversacion();
                return conv.getId();
            });

            // Enviar mensaje al chatbot
            ChatResponseDTO respuesta = chatbotService.enviarMensaje(convId, texto);

            // Escapar el texto para MarkdownV2 de Telegram y enviarlo
            String textoEscapado = escaparMarkdownV2(respuesta.getRespuesta());
            sendMessage(chatId, textoEscapado);

            // Si hay vehículos recomendados, enviarlos como mensaje adicional
            List<Vehiculo> vehiculos = respuesta.getVehiculos();
            if (vehiculos != null && !vehiculos.isEmpty()) {
                StringBuilder sb = new StringBuilder("🚗 *Vehículos recomendados:*\n\n");
                for (Vehiculo v : vehiculos) {
                    String precio = v.getPrecio() != null
                        ? String.format("%,.0f€", v.getPrecio().doubleValue()).replace(",", "\\.")
                        : "Consultar";
                    String km = v.getKilometros() != null
                        ? String.format("%,d km", v.getKilometros()).replace(",", "\\.")
                        : "";
                    String color = v.getColor() != null ? escaparMarkdownV2(v.getColor()) : "";
                    String marca = escaparMarkdownV2(v.getMarca() + " " + v.getModelo());
                    String version = v.getVersion() != null ? escaparMarkdownV2(v.getVersion()) : "";

                    sb.append("• *").append(marca).append("*");
                    if (!version.isEmpty()) sb.append(" \\(").append(version).append("\\)");
                    sb.append("\n");
                    sb.append("  💰 ").append(precio);
                    if (!km.isEmpty()) sb.append(" · ").append(km);
                    if (!color.isEmpty()) sb.append(" · 🎨 ").append(color);
                    sb.append("\n\n");
                }
                sendMessage(chatId, sb.toString());
            }

        } catch (Exception e) {
            System.err.println("Error procesando update de Telegram: " + e.getMessage());
        }
        return ResponseEntity.ok().build();
    }

    private void sendMessage(Long chatId, String text) {
        String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";
        Map<String, Object> body = Map.of(
            "chat_id", chatId,
            "text", text,
            "parse_mode", "MarkdownV2"
        );
        try {
            restTemplate.postForObject(url, body, Map.class);
        } catch (Exception e) {
            System.err.println("Error enviando mensaje a Telegram: " + e.getMessage());
        }
    }

    // MarkdownV2 de Telegram requiere escapar estos caracteres con \
    private String escaparMarkdownV2(String texto) {
        if (texto == null) return "";
        return texto
            .replace("\\", "\\\\")
            .replace("_", "\\_")
            .replace("*", "\\*")
            .replace("[", "\\[")
            .replace("]", "\\]")
            .replace("(", "\\(")
            .replace(")", "\\)")
            .replace("~", "\\~")
            .replace("`", "\\`")
            .replace(">", "\\>")
            .replace("#", "\\#")
            .replace("+", "\\+")
            .replace("-", "\\-")
            .replace("=", "\\=")
            .replace("|", "\\|")
            .replace("{", "\\{")
            .replace("}", "\\}")
            .replace(".", "\\.")
            .replace("!", "\\!");
    }
}
