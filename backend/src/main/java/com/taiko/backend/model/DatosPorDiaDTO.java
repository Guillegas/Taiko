package com.taiko.backend.model;

public class DatosPorDiaDTO {
    private String fecha;
    private Long cantidad;

    public DatosPorDiaDTO(String fecha, Long cantidad) {
        this.fecha = fecha;
        this.cantidad = cantidad;
    }

    public String getFecha() { return fecha; }
    public Long getCantidad() { return cantidad; }
}
