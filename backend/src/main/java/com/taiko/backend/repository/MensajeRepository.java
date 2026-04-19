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

    @org.springframework.data.jpa.repository.Modifying
    @jakarta.transaction.Transactional
    void deleteByConversacionId(UUID conversacionId);
}
