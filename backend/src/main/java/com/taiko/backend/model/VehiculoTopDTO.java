package com.taiko.backend.model;

public class VehiculoTopDTO {
    private String marca;
    private String modelo;
    private Long veces;

    public VehiculoTopDTO(String marca, String modelo, Long veces) {
        this.marca = marca;
        this.modelo = modelo;
        this.veces = veces;
    }

    public String getMarca() { return marca; }
    public String getModelo() { return modelo; }
    public Long getVeces() { return veces; }
}
