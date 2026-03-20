package com.taiko.backend.model;

import java.math.BigDecimal;
import java.util.List;

public class VehiculoRequestDTO {

    private String marca;
    private String modelo;
    private String version;
    private String vin;
    private Integer anio;
    private Integer kilometros;
    private BigDecimal precio;
    private String color;
    private String descripcion;
    private Boolean disponible;

    // Relaciones Simples (IDs)
    private Integer carroceriaId;
    private Integer transmisionId;
    private Integer etiquetaAmbientalId;

    // Relaciones Múltiples (Listas de IDs)
    private List<Integer> combustibleIds;
    private List<Integer> equipamientoIds;

    // Getters y Setters
    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getVin() { return vin; }
    public void setVin(String vin) { this.vin = vin; }

    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }

    public Integer getKilometros() { return kilometros; }
    public void setKilometros(Integer kilometros) { this.kilometros = kilometros; }

    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Boolean getDisponible() { return disponible; }
    public void setDisponible(Boolean disponible) { this.disponible = disponible; }

    // Getters y Setters para IDs
    public Integer getCarroceriaId() { return carroceriaId; }
    public void setCarroceriaId(Integer carroceriaId) { this.carroceriaId = carroceriaId; }

    public Integer getTransmisionId() { return transmisionId; }
    public void setTransmisionId(Integer transmisionId) { this.transmisionId = transmisionId; }

    public Integer getEtiquetaAmbientalId() { return etiquetaAmbientalId; }
    public void setEtiquetaAmbientalId(Integer etiquetaAmbientalId) { this.etiquetaAmbientalId = etiquetaAmbientalId; }

    public List<Integer> getCombustibleIds() { return combustibleIds; }
    public void setCombustibleIds(List<Integer> combustibleIds) { this.combustibleIds = combustibleIds; }

    public List<Integer> getEquipamientoIds() { return equipamientoIds; }
    public void setEquipamientoIds(List<Integer> equipamientoIds) { this.equipamientoIds = equipamientoIds; }
}
