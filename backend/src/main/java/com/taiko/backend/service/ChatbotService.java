package com.taiko.backend.service;

import com.taiko.backend.model.Conversacion;
import com.taiko.backend.model.Mensaje;
import com.taiko.backend.model.EmisorMensaje;
import com.taiko.backend.repository.ConversacionRepository;
import com.taiko.backend.repository.MensajeRepository;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ChatbotService {

    @Autowired
    private ConversacionRepository conversacionRepository;

    @Autowired
    private MensajeRepository mensajeRepository;

    @Autowired
    private ChatModel chatModel;

    // TODO: Inyectar VehiculoService para hacer la búsqueda semántica e inyectar el catálogo
    @Autowired
    private VehiculoService vehiculoService;

    private static final String SYSTEM_PROMPT = """
        Eres un asistente experto en ventas de vehículos del concesionario Taiko Motors.
        Eres amable, directo, profesional pero con un toque cercano.
        Tu principal objetivo es ayudar al usuario a encontrar el coche perfecto analizando lo que dice
        y proporcionándole información sobre los vehículos que tenemos en stock.
        
        Siempre debes responder en español y mantener las respuestas relativamente breves y útiles.
        No hables sobre temas que no tengan que ver con comprar/ver vehículos.
        """;

    @Transactional
    public Conversacion iniciarConversacion() {
        Conversacion conversacion = new Conversacion();
        conversacion.setCanal("web");
        return conversacionRepository.save(conversacion);
    }

    @Transactional
    public String enviarMensaje(UUID conversacionId, String textoUsuario) {
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
        springAiMessages.add(new SystemMessage(SYSTEM_PROMPT)); // Siempre al principio

        // Inyectar el inventario actual de vehículos para que la IA sepa qué vender
        try {
            List<com.taiko.backend.model.Vehiculo> inventario = vehiculoService.getAllVehiculos();
            // Convertimos la lista cruda a un string JSON resumido para no ahogar a la IA con tokens
            StringBuilder inventarioTexto = new StringBuilder("INVENTARIO ACTUAL EN STOCK:\n");
            for (com.taiko.backend.model.Vehiculo v : inventario) {
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

        // 5. Llamar a OpenAI pasando todo el historial como un "Prompt"
        Prompt prompt = new Prompt(springAiMessages);
        String respuestaLlm = chatModel.call(prompt).getResult().getOutput().getContent();

        // 6. Guardar la respuesta del Asistente en la BD
        Mensaje mensajeAsistente = new Mensaje();
        mensajeAsistente.setConversacion(conversacion);
        mensajeAsistente.setEmisor(EmisorMensaje.chatbot);
        mensajeAsistente.setContenido(respuestaLlm);
        mensajeRepository.save(mensajeAsistente);

        return respuestaLlm;
    }

    public List<Mensaje> obtenerHistorial(UUID conversacionId) {
        return mensajeRepository.findByConversacionIdOrderByFechaEnvioAsc(conversacionId);
    }

    /**
     * Exporta el historial de una conversación a formato texto plano.
     */
    public String exportConversacionToTxt(UUID conversacionId) {
        List<Mensaje> mensajes = obtenerHistorial(conversacionId);
        StringBuilder sb = new StringBuilder();
        sb.append("=========================================\n");
        sb.append("Historial de Chat - TAIKO Assistant\n");
        sb.append("ID Conversación: ").append(conversacionId).append("\n");
        sb.append("=========================================\n\n");
        
        for (Mensaje msg : mensajes) {
            String emisorNombre = msg.getEmisor() == EmisorMensaje.cliente ? "Usuario" : "TAIKO Bot";
            
            // Format timestamp if available, else omit
            String timeStr = msg.getFechaEnvio() != null ? 
                "[" + msg.getFechaEnvio().toString().substring(0, 19).replace("T", " ") + "] " : "";
                
            sb.append(timeStr).append(emisorNombre).append(":\n");
            sb.append(msg.getContenido()).append("\n\n");
        }
        
        return sb.toString();
    }
}
