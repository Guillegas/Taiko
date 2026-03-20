package com.taiko.backend.repository;

import com.taiko.backend.model.Imagen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ImagenRepository extends JpaRepository<Imagen, UUID> {
}
