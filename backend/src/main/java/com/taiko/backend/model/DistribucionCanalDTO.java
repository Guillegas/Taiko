package com.taiko.backend.model;

public class DistribucionCanalDTO {
    private String canal;
    private Long cantidad;

    public DistribucionCanalDTO(String canal, Long cantidad) {
        this.canal = canal;
        this.cantidad = cantidad;
    }

    public String getCanal() { return canal; }
    public Long getCantidad() { return cantidad; }
}
