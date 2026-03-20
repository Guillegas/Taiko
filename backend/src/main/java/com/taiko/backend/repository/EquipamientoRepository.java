package com.taiko.backend.repository;

import com.taiko.backend.model.Equipamiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipamientoRepository extends JpaRepository<Equipamiento, Integer> {
    Equipamiento findByNombre(String nombre);
}
