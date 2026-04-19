package com.taiko.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.taiko.backend.model.*;
import com.taiko.backend.repository.ConversacionRepository;
import com.taiko.backend.repository.MensajeRepository;
import com.taiko.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.messages.*;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    private static final Logger log = LoggerFactory.getLogger(ChatbotService.class);

    @Autowired private ConversacionRepository conversacionRepository;
    @Autowired private MensajeRepository mensajeRepository;
    @Autowired private ChatModel chatModel;
    @Autowired private VehiculoService vehiculoService;
    @Autowired private UserRepository userRepository;
    @Autowired private ObjectMapper objectMapper;

    // Prompt del sistema que define el comportamiento del asistente
    private static final String SYSTEM_PROMPT = """
        Eres un asistente experto en ventas de vehículos del concesionario Taiko Motors.
        Eres amable, directo, profesional pero con un toque cercano.
        Tu objetivo principal es ayudar al usuario a encontrar el coche perfecto según lo que necesita.

        Responde siempre en español y sé conciso. No hables de temas ajenos a la compraventa de vehículos.

        IMPORTANTE: Cuando recomiendes coches concretos del inventario, añade al final de tu respuesta
        (como última línea, sin nada después) esta etiqueta con los UUIDs separados por comas:
        [COCHES:uuid1,uuid2,uuid3]
        Si no recomiendas ningún coche del stock, no añadas nada especial.
        """;

    // Patrón para extraer la etiqueta [COCHES:...] de las respuestas del LLM
    private static final Pattern COCHES_TAG = Pattern.compile("\\[COCHES:([^\\]]+)\\]");

    /** Inicia una conversación anónima (sin usuario asociado). */
    @Transactional
    public Conversacion iniciarConversacion() {
        return iniciarConversacion(null);
    }

    /** Inicia una conversación. Si se proporciona usuario, queda vinculada a su cuenta. */
    @Transactional
    public Conversacion iniciarConversacion(User usuario) {
        Conversacion conversacion = new Conversacion();
        conversacion.setCanal("web");
        if (usuario != null) conversacion.setUsuario(usuario);
        return conversacionRepository.save(conversacion);
    }

    /** Devuelve el resumen de todas las conversaciones de un usuario ordenadas por fecha. */
    public List<ConversacionResumenDTO> getMisConversaciones(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        return conversacionRepository.findByUsuarioIdOrderByFechaInicioDesc(user.getId())
                .stream()
                .map(conv -> {
                    Mensaje primero = mensajeRepository.findFirstByConversacionIdAndEmisorOrderByFechaEnvioAsc(
                            conv.getId(), EmisorMensaje.cliente);
                    long total = mensajeRepository.countByConversacionId(conv.getId());
                    String preview = primero != null ? primero.getContenido() : "Conversación vacía";
                    if (preview.length() > 90) preview = preview.substring(0, 90) + "...";
                    return new ConversacionResumenDTO(conv.getId(), conv.getFechaInicio(), preview, total);
                })
                .collect(Collectors.toList());
    }

    /** Elimina una conversación verificando que pertenece al usuario autenticado. */
    @Transactional
    public void deleteConversacion(UUID convId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        // Busca por ID y usuario en una sola query para evitar accesos no autorizados
        conversacionRepository.findByIdAndUsuarioId(convId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Conversación no encontrada o sin permiso"));

        mensajeRepository.deleteByConversacionId(convId);
        conversacionRepository.deleteById(convId);
    }

    /**
     * Procesa un mensaje del usuario: lo guarda, construye el contexto con el inventario
     * actual e historial, llama al LLM y persiste la respuesta.
     */
    @Transactional
    public ChatResponseDTO enviarMensaje(UUID conversacionId, String textoUsuario) {
        Conversacion conversacion = conversacionRepository.findById(conversacionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversación no encontrada"));

        // Persistir el mensaje del usuario
        Mensaje mensajeUsuario = new Mensaje();
        mensajeUsuario.setConversacion(conversacion);
        mensajeUsuario.setEmisor(EmisorMensaje.cliente);
        mensajeUsuario.setContenido(textoUsuario);
        mensajeRepository.save(mensajeUsuario);

        // Construir el historial de mensajes para Spring AI
        List<Message> springAiMessages = new ArrayList<>();
        springAiMessages.add(new SystemMessage(SYSTEM_PROMPT));

        // Inyectar el inventario disponible como contexto del sistema
        try {
            List<Vehiculo> inventario = vehiculoService.getAllVehiculos();
            StringBuilder inventarioTexto = new StringBuilder("INVENTARIO ACTUAL EN STOCK:\n");
            for (Vehiculo v : inventario) {
                if (Boolean.TRUE.equals(v.getDisponible())) {
                    String combustible = v.getCombustibles().isEmpty()
                            ? "Varios" : v.getCombustibles().get(0).getNombre();
                    inventarioTexto.append(String.format(
                            "- ID: %s | %s %s | %.0f€ | %s | %d km | Motor: %s\n",
                            v.getId(), v.getMarca(), v.getModelo(),
                            v.getPrecio(), v.getColor(), v.getKilometros(), combustible));
                }
            }
            springAiMessages.add(new SystemMessage(inventarioTexto.toString()));
        } catch (Exception e) {
            log.warn("No se pudo inyectar el inventario al prompt del chat", e);
        }

        // Añadir el historial previo de la conversación
        mensajeRepository.findByConversacionIdOrderByFechaEnvioAsc(conversacionId)
                .forEach(msg -> {
                    if (msg.getEmisor() == EmisorMensaje.cliente) {
                        springAiMessages.add(new UserMessage(msg.getContenido()));
                    } else {
                        springAiMessages.add(new AssistantMessage(msg.getContenido()));
                    }
                });

        // Llamar al LLM
        String respuestaLlm = chatModel.call(new Prompt(springAiMessages))
                .getResult().getOutput().getContent();

        // Persistir la respuesta completa (incluyendo la etiqueta [COCHES:...] si la hay)
        Mensaje mensajeAsistente = new Mensaje();
        mensajeAsistente.setConversacion(conversacion);
        mensajeAsistente.setEmisor(EmisorMensaje.chatbot);
        mensajeAsistente.setContenido(respuestaLlm);
        mensajeRepository.save(mensajeAsistente);

        return parsearRespuesta(respuestaLlm);
    }

    /** Devuelve el historial completo parseando etiquetas de vehículos en cada mensaje. */
    public List<MensajeConVehiculosDTO> obtenerHistorial(UUID conversacionId) {
        return mensajeRepository.findByConversacionIdOrderByFechaEnvioAsc(conversacionId)
                .stream()
                .map(msg -> {
                    if (msg.getEmisor() == EmisorMensaje.chatbot) {
                        ChatResponseDTO parsed = parsearRespuesta(msg.getContenido());
                        return new MensajeConVehiculosDTO("chatbot", parsed.getRespuesta(), parsed.getVehiculos());
                    }
                    return new MensajeConVehiculosDTO("cliente", msg.getContenido(), List.of());
                })
                .toList();
    }

    /** Exporta el historial de la conversación en formato TXT plano. */
    public String exportConversacionToTxt(UUID conversacionId) {
        List<MensajeConVehiculosDTO> mensajes = obtenerHistorial(conversacionId);
        StringBuilder sb = new StringBuilder();
        sb.append("=========================================\n");
        sb.append("Historial de Chat - Taiko Motors\n");
        sb.append("ID Conversación: ").append(conversacionId).append("\n");
        sb.append("=========================================\n\n");
        for (MensajeConVehiculosDTO msg : mensajes) {
            String emisor = "cliente".equals(msg.getEmisor()) ? "Usuario" : "Taiko Bot";
            sb.append(emisor).append(":\n").append(msg.getContenido()).append("\n\n");
        }
        return sb.toString();
    }

    /** Exporta el historial de la conversación en formato JSON estructurado. */
    public String exportConversacionToJson(UUID conversacionId) {
        List<MensajeConVehiculosDTO> mensajes = obtenerHistorial(conversacionId);
        try {
            ObjectNode root = objectMapper.createObjectNode();
            root.put("conversacion_id", conversacionId.toString());
            root.put("exportado_el", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            ArrayNode mensajesNode = root.putArray("mensajes");
            for (MensajeConVehiculosDTO msg : mensajes) {
                ObjectNode m = mensajesNode.addObject();
                m.put("emisor", "cliente".equals(msg.getEmisor()) ? "Usuario" : "Taiko Bot");
                m.put("contenido", msg.getContenido());
            }
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(root);
        } catch (Exception e) {
            log.error("Error generando exportación JSON de conversación {}", conversacionId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al generar el archivo JSON");
        }
    }

    /**
     * Extrae la etiqueta [COCHES:...] de la respuesta del LLM, recupera los vehículos
     * referenciados y devuelve la respuesta limpia junto a ellos.
     */
    private ChatResponseDTO parsearRespuesta(String contenidoRaw) {
        List<Vehiculo> vehiculosMencionados = new ArrayList<>();
        String respuestaLimpia = contenidoRaw;

        Matcher matcher = COCHES_TAG.matcher(contenidoRaw);
        if (matcher.find()) {
            respuestaLimpia = contenidoRaw.substring(0, matcher.start()).trim();
            Arrays.stream(matcher.group(1).split(","))
                    .map(String::trim)
                    .forEach(idStr -> {
                        try {
                            vehiculosMencionados.add(vehiculoService.getVehiculoById(UUID.fromString(idStr)));
                        } catch (Exception ignored) {
                            // UUID no encontrado: se omite sin interrumpir el flujo
                        }
                    });
        }

        return new ChatResponseDTO(respuestaLimpia, vehiculosMencionados);
    }
}
