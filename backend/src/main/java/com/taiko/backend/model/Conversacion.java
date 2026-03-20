package com.taiko.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "conversaciones")
public class Conversacion {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private User usuario; // Puede ser nulo si permitimos chats anónimos

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehiculo_contexto_id")
    private Vehiculo vehiculoContexto; // Puede ser nulo. Vehículo del que se está hablando

    private String canal = "web";

    @Column(name = "fecha_inicio", insertable = false, updatable = false)
    private LocalDateTime fechaInicio;

    public Conversacion() {}

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUsuario() {
        return usuario;
    }

    public void setUsuario(User usuario) {
        this.usuario = usuario;
    }

    public Vehiculo getVehiculoContexto() {
        return vehiculoContexto;
    }

    public void setVehiculoContexto(Vehiculo vehiculoContexto) {
        this.vehiculoContexto = vehiculoContexto;
    }

    public String getCanal() {
        return canal;
    }

    public void setCanal(String canal) {
        this.canal = canal;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }
}
