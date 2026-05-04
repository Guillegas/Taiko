package com.taiko.backend.repository;

import com.taiko.backend.model.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, UUID> {
    List<Mensaje> findByConversacionIdOrderByFechaEnvioAsc(UUID conversacionId);
    Mensaje findFirstByConversacionIdAndEmisorOrderByFechaEnvioAsc(UUID conversacionId, com.taiko.backend.model.EmisorMensaje emisor);
    long countByConversacionId(UUID conversacionId);
    long countByConversacionIdAndEmisor(UUID conversacionId, com.taiko.backend.model.EmisorMensaje emisor);

    @org.springframework.data.jpa.repository.Modifying
    @jakarta.transaction.Transactional
    void deleteByConversacionId(UUID conversacionId);

    // Extrae UUIDs de vehículos mencionados en mensajes del chatbot y devuelve el top 5 más recomendados
    @org.springframework.data.jpa.repository.Query(
        value = """
            SELECT v.marca, v.modelo, COUNT(*) AS veces
            FROM (
                SELECT unnest(regexp_matches(m.contenido,
                    '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', 'g'
                )) AS uuid_str
                FROM mensajes m
                WHERE m.emisor::text = 'chatbot'
            ) AS uuids
            JOIN vehiculos v ON v.id = uuid_str::uuid
            GROUP BY v.id, v.marca, v.modelo
            ORDER BY veces DESC
            LIMIT 5
            """,
        nativeQuery = true)
    List<Object[]> topVehiculosRecomendados();
}
