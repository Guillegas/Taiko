package com.taiko.backend.repository;

import com.taiko.backend.model.Conversacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface ConversacionRepository extends JpaRepository<Conversacion, UUID> {
    List<Conversacion> findByUsuarioId(UUID usuarioId);
}
