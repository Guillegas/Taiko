package com.taiko.backend.model;

import java.util.List;

public class ChatResponseDTO {

    private String respuesta;
    private List<Vehiculo> vehiculos;

    public ChatResponseDTO(String respuesta, List<Vehiculo> vehiculos) {
        this.respuesta = respuesta;
        this.vehiculos = vehiculos;
    }

    public String getRespuesta() { return respuesta; }
    public List<Vehiculo> getVehiculos() { return vehiculos; }
}
