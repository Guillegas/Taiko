package com.taiko.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

/**
 * Entidad que almacena los metadatos del embedding de un vehículo.
 * El campo embedding VECTOR(1536) lo gestionamos con queries nativas en el repositorio.
 */
@Data
@Entity
@Table(name = "vehicle_embeddings")
public class VehicleEmbedding {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "vehiculo_id", nullable = false)
    private UUID vehiculoId;

    @Column(name = "texto_procesado", columnDefinition = "TEXT")
    private String textoProcesado;

    @Column(name = "modelo_ia")
    private String modeloIa = "text-embedding-3-small";
}
