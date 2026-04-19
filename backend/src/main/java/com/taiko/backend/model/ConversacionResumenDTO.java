package com.taiko.backend.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class ConversacionResumenDTO {
    private UUID id;
    private LocalDateTime fechaInicio;
    private String preview;
    private long totalMensajes;

    public ConversacionResumenDTO(UUID id, LocalDateTime fechaInicio, String preview, long totalMensajes) {
        this.id = id;
        this.fechaInicio = fechaInicio;
        this.preview = preview;
        this.totalMensajes = totalMensajes;
    }

    public UUID getId() { return id; }
    public LocalDateTime getFechaInicio() { return fechaInicio; }
    public String getPreview() { return preview; }
    public long getTotalMensajes() { return totalMensajes; }
}
