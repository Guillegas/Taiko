package com.taiko.backend.repository;

import com.taiko.backend.model.VehicleEmbedding;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VehicleEmbeddingRepository extends JpaRepository<VehicleEmbedding, UUID> {

    /**
     * Inserta un embedding en la tabla vehicle_embeddings usando una query nativa.
     * Usamos CAST(:vectorString AS vector) para que pgvector interprete el string
     * con formato "[0.1, 0.2, ...]" como tipo vector.
     * Si el coche ya tiene embedding, lo actualizamos (ON CONFLICT).
     */
    @Modifying
    @Transactional
    @Query(value = """
            INSERT INTO vehicle_embeddings (vehiculo_id, texto_procesado, modelo_ia, embedding)
            VALUES (:vehiculoId, :texto, :modelo, CAST(:vectorString AS vector))
            ON CONFLICT (vehiculo_id) DO UPDATE 
            SET texto_procesado = EXCLUDED.texto_procesado,
                embedding = EXCLUDED.embedding,
                fecha_generado = CURRENT_TIMESTAMP
            """, nativeQuery = true)
    void insertEmbedding(
            @Param("vehiculoId") UUID vehiculoId,
            @Param("texto")       String texto,
            @Param("modelo")      String modelo,
            @Param("vectorString") String vectorString
    );

    /**
     * Busca los vehículos más similares ordenados por distancia coseno (<=>).
     * Distancia de 0 es exacto, 2 es completamente opuesto.
     * Filtramos para traer solo los que tengan una distancia razonable (ej. < 0.6)
     * Devuelve Object[] donde [0] es el vehiculo_id y [1] es la distancia.
     */
    @Query(value = """
            SELECT vehiculo_id, (embedding <=> CAST(:vectorString AS vector)) as distancia
            FROM vehicle_embeddings
            ORDER BY distancia ASC
            LIMIT :limite
            """, nativeQuery = true)
    List<Object[]> searchSimilarVehicles(
            @Param("vectorString") String vectorString,
            @Param("limite") int limite
    );

    @Modifying
    @Transactional
    void deleteByVehiculoId(UUID vehiculoId);
}

