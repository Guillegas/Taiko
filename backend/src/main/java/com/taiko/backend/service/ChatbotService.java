package com.taiko.backend.service;

import com.taiko.backend.model.ChatResponseDTO;
import com.taiko.backend.model.Conversacion;
import com.taiko.backend.model.ConversacionResumenDTO;
import com.taiko.backend.model.EmisorMensaje;
import com.taiko.backend.model.Mensaje;
import com.taiko.backend.model.MensajeConVehiculosDTO;
import com.taiko.backend.model.User;
import com.taiko.backend.model.Vehiculo;
import com.taiko.backend.repository.ConversacionRepository;
import com.taiko.backend.repository.MensajeRepository;
import com.taiko.backend.repository.UserRepository;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    @Autowired
    private ConversacionRepository conversacionRepository;

    @Autowired
    private MensajeRepository mensajeRepository;

    @Autowired
    private ChatModel chatModel;

    @Autowired
    private VehiculoService vehiculoService;

    @Autowired
    private UserRepository userRepository;

    private static final String SYSTEM_PROMPT = """
        Eres un asistente experto en ventas de vehículos del concesionario Taiko Motors.
        Eres amable, directo, profesional pero con un toque cercano.
        Tu principal objetivo es ayudar al usuario a encontrar el coche perfecto analizando lo que dice
        y proporcionándole información sobre los vehículos que tenemos en stock.

        Siempre debes responder en español y mantener las respuestas relativamente breves y útiles.
        No hables sobre temas que no tengan que ver con comprar/ver vehículos.

        IMPORTANTE: Cuando recomiendes o menciones coches concretos del inventario, añade al final de tu \
        respuesta (como última línea, sin nada después) exactamente esta etiqueta con los UUIDs separados por comas:
        [COCHES:uuid1,uuid2,uuid3]
        Si no recomiendas ningún coche concreto del stock, no añadas nada especial.
        """;

    private static final Pattern COCHES_TAG = Pattern.compile("\\[COCHES:([^\\]]+)\\]");

    @Transactional
    public Conversacion iniciarConversacion() {
        return iniciarConversacion(null);
    }

    @Transactional
    public Conversacion iniciarConversacion(User usuario) {
        Conversacion conversacion = new Conversacion();
        conversacion.setCanal("web");
        if (usuario != null) conversacion.setUsuario(usuario);
        return conversacionRepository.save(conversacion);
    }

    public List<ConversacionResumenDTO> getMisConversaciones(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        List<Conversacion> convs = conversacionRepository.findByUsuarioIdOrderByFechaInicioDesc(user.getId());
        return convs.stream().map(conv -> {
            Mensaje primero = mensajeRepository.findFirstByConversacionIdAndEmisorOrderByFechaEnvioAsc(
                    conv.getId(), EmisorMensaje.cliente);
            long total = mensajeRepository.countByConversacionId(conv.getId());
            String preview = primero != null ? primero.getContenido() : "Conversación vacía";
            if (preview.length() > 90) preview = preview.substring(0, 90) + "...";
            return new ConversacionResumenDTO(conv.getId(), conv.getFechaInicio(), preview, total);
        }).collect(Collectors.toList());
    }

    @Transactional
    public void deleteConversacion(UUID convId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        // Buscar por ID y usuario en una sola query — evita lazy loading de 'usuario'
        conversacionRepository.findByIdAndUsuarioId(convId, user.getId())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Conversación no encontrada o sin permiso"));
        mensajeRepository.deleteByConversacionId(convId);
        conversacionRepository.deleteById(convId);
    }

    @Transactional
    public ChatResponseDTO enviarMensaje(UUID conversacionId, String textoUsuario) {
        // 1. Obtener la conversación
        Conversacion conversacion = conversacionRepository.findById(conversacionId)
                .orElseThrow(() -> new IllegalArgumentException("Conversación no encontrada"));

        // 2. Guardar el mensaje del usuario en la BD
        Mensaje mensajeUsuario = new Mensaje();
        mensajeUsuario.setConversacion(conversacion);
        mensajeUsuario.setEmisor(EmisorMensaje.cliente);
        mensajeUsuario.setContenido(textoUsuario);
        mensajeRepository.save(mensajeUsuario);

        // 3. Recuperar todo el historial de la conversación
        List<Mensaje> historialDb = mensajeRepository.findByConversacionIdOrderByFechaEnvioAsc(conversacionId);

        // 4. Transformar el historial de DB al formato de Spring AI (Messages)
        List<Message> springAiMessages = new ArrayList<>();
        springAiMessages.add(new SystemMessage(SYSTEM_PROMPT));

        // Inyectar el inventario actual de vehículos para que la IA sepa qué vender
        try {
            List<Vehiculo> inventario = vehiculoService.getAllVehiculos();
            StringBuilder inventarioTexto = new StringBuilder("INVENTARIO ACTUAL EN STOCK:\n");
            for (Vehiculo v : inventario) {
                if (v.getDisponible() != null && v.getDisponible()) {
                    inventarioTexto.append(String.format("- ID: %s | %s %s | %.0f€ | %s | %d km | Motor: %s\n",
                        v.getId(), v.getMarca(), v.getModelo(), v.getPrecio(), v.getColor(), v.getKilometros(),
                        (v.getCombustibles().isEmpty() ? "Vario" : v.getCombustibles().get(0).getNombre())
                    ));
                }
            }
            springAiMessages.add(new SystemMessage(inventarioTexto.toString()));
        } catch (Exception e) {
            System.err.println("Error inyectando inventario al prompt: " + e.getMessage());
        }

        for (Mensaje msg : historialDb) {
            if (msg.getEmisor() == EmisorMensaje.cliente) {
                springAiMessages.add(new UserMessage(msg.getContenido()));
            } else if (msg.getEmisor() == EmisorMensaje.chatbot) {
                springAiMessages.add(new AssistantMessage(msg.getContenido()));
            }
        }

        // 5. Llamar a OpenAI
        Prompt prompt = new Prompt(springAiMessages);
        String respuestaLlm = chatModel.call(prompt).getResult().getOutput().getContent();

        // 6. Guardar la respuesta RAW (con la etiqueta) para poder recuperar los vehículos en el historial
        Mensaje mensajeAsistente = new Mensaje();
        mensajeAsistente.setConversacion(conversacion);
        mensajeAsistente.setEmisor(EmisorMensaje.chatbot);
        mensajeAsistente.setContenido(respuestaLlm);
        mensajeRepository.save(mensajeAsistente);

        // 7. Parsear la etiqueta para la respuesta inmediata al frontend
        return parsearMensajeChatbot(respuestaLlm);
    }

    private ChatResponseDTO parsearMensajeChatbot(String contenidoRaw) {
        List<Vehiculo> vehiculosMencionados = new ArrayList<>();
        String respuestaLimpia = contenidoRaw;
        Matcher matcher = COCHES_TAG.matcher(contenidoRaw);
        if (matcher.find()) {
            String idsStr = matcher.group(1);
            respuestaLimpia = contenidoRaw.substring(0, matcher.start()).trim();
            Arrays.stream(idsStr.split(","))
                .map(String::trim)
                .forEach(idStr -> {
                    try {
                        vehiculosMencionados.add(vehiculoService.getVehiculoById(UUID.fromString(idStr)));
                    } catch (Exception ignored) {}
                });
        }
        return new ChatResponseDTO(respuestaLimpia, vehiculosMencionados);
    }

    public List<MensajeConVehiculosDTO> obtenerHistorial(UUID conversacionId) {
        List<Mensaje> mensajes = mensajeRepository.findByConversacionIdOrderByFechaEnvioAsc(conversacionId);
        return mensajes.stream().map(msg -> {
            if (msg.getEmisor() == EmisorMensaje.chatbot) {
                ChatResponseDTO parsed = parsearMensajeChatbot(msg.getContenido());
                return new MensajeConVehiculosDTO("chatbot", parsed.getRespuesta(), parsed.getVehiculos());
            }
            return new MensajeConVehiculosDTO("cliente", msg.getContenido(), List.of());
        }).toList();
    }

    public String exportConversacionToJson(UUID conversacionId) {
        List<MensajeConVehiculosDTO> mensajes = obtenerHistorial(conversacionId);
        try {
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode root = mapper.createObjectNode();
            root.put("conversacion_id", conversacionId.toString());
            root.put("exportado_el", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            ArrayNode mensajesNode = root.putArray("mensajes");
            for (MensajeConVehiculosDTO msg : mensajes) {
                ObjectNode m = mensajesNode.addObject();
                m.put("emisor", "cliente".equals(msg.getEmisor()) ? "Usuario" : "TAIKO Bot");
                m.put("contenido", msg.getContenido());
            }
            return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(root);
        } catch (Exception e) {
            throw new RuntimeException("Error generando JSON", e);
        }
    }

    public String exportConversacionToTxt(UUID conversacionId) {
        List<MensajeConVehiculosDTO> mensajes = obtenerHistorial(conversacionId);
        StringBuilder sb = new StringBuilder();
        sb.append("=========================================\n");
        sb.append("Historial de Chat - TAIKO Assistant\n");
        sb.append("ID Conversación: ").append(conversacionId).append("\n");
        sb.append("=========================================\n\n");
        for (MensajeConVehiculosDTO msg : mensajes) {
            String emisorNombre = "cliente".equals(msg.getEmisor()) ? "Usuario" : "TAIKO Bot";
            sb.append(emisorNombre).append(":\n");
            sb.append(msg.getContenido()).append("\n\n");
        }
        return sb.toString();
    }
}
