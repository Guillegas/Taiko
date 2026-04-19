package com.taiko.backend.model;

import java.util.List;

public class MensajeConVehiculosDTO {

    private String emisor;
    private String contenido;
    private List<Vehiculo> vehiculos;

    public MensajeConVehiculosDTO(String emisor, String contenido, List<Vehiculo> vehiculos) {
        this.emisor = emisor;
        this.contenido = contenido;
        this.vehiculos = vehiculos;
    }

    public String getEmisor() { return emisor; }
    public String getContenido() { return contenido; }
    public List<Vehiculo> getVehiculos() { return vehiculos; }
}
