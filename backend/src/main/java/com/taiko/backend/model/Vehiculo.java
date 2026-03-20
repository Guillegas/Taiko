package com.taiko.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data // Lombok genera automáticamente getters, setters, equals, hashCode y toString
@Entity
@Table(name = "vehiculos")
public class Vehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String marca;
    private String modelo;
    private String version;
    private String vin;
    private Integer anio;
    private Integer kilometros;
    private BigDecimal precio;
    private String color;
    private String descripcion;

    @Column(name = "disponible")
    private Boolean disponible;

    @Column(name = "fecha_alta", insertable = false, updatable = false)
    private LocalDateTime fechaAlta;

    // ─────────────────────────────────────────────────────────────────────────
    // RELACIONES (ManyToOne)
    // ─────────────────────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "carroceria_id")
    private Carroceria carroceria;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "transmision_id")
    private Transmision transmision;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "etiqueta_id")
    private EtiquetaAmbiental etiquetaAmbiental;

    // ─────────────────────────────────────────────────────────────────────────
    // RELACIONES (OneToMany)
    // ─────────────────────────────────────────────────────────────────────────

    // Un vehículo puede tener muchas imágenes
    @OneToMany(mappedBy = "vehiculo", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Imagen> imagenes = new java.util.ArrayList<>();

    // ─────────────────────────────────────────────────────────────────────────
    // RELACIONES (ManyToMany)
    // ─────────────────────────────────────────────────────────────────────────

    @ManyToMany
    @JoinTable(
        name = "vehiculo_combustibles",
        joinColumns = @JoinColumn(name = "vehiculo_id"),
        inverseJoinColumns = @JoinColumn(name = "combustible_id")
    )
    private java.util.List<Combustible> combustibles = new java.util.ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "vehiculo_equipamiento",
        joinColumns = @JoinColumn(name = "vehiculo_id"),
        inverseJoinColumns = @JoinColumn(name = "equipamiento_id")
    )
    private java.util.List<Equipamiento> equipamiento = new java.util.ArrayList<>();
}
