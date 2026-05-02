package com.taiko.backend.repository;

import com.taiko.backend.model.Conversacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversacionRepository extends JpaRepository<Conversacion, UUID> {
    List<Conversacion> findByUsuarioId(UUID usuarioId);
    List<Conversacion> findByUsuarioIdOrderByFechaInicioDesc(UUID usuarioId);
    Optional<Conversacion> findByIdAndUsuarioId(UUID id, UUID usuarioId);

    // Cuenta conversaciones agrupadas por día para la serie temporal del dashboard
    @Query(value = "SELECT CAST(fecha_inicio AS DATE) AS fecha, COUNT(*) AS cantidad " +
                   "FROM conversaciones WHERE fecha_inicio >= :desde " +
                   "GROUP BY CAST(fecha_inicio AS DATE) ORDER BY fecha ASC",
           nativeQuery = true)
    List<Object[]> countConversacionesPorDia(@Param("desde") LocalDateTime desde);

    // Distribución de conversaciones por canal (web / telegram)
    @Query("SELECT c.canal, COUNT(c) FROM Conversacion c GROUP BY c.canal")
    List<Object[]> countPorCanal();
}
