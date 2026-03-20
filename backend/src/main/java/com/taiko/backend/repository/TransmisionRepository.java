package com.taiko.backend.repository;

import com.taiko.backend.model.Transmision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransmisionRepository extends JpaRepository<Transmision, Integer> {
    Transmision findByNombre(String nombre);
}
