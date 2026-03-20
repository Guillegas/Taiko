package com.taiko.backend.repository;

import com.taiko.backend.model.Carroceria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarroceriaRepository extends JpaRepository<Carroceria, Integer> {
    Carroceria findByNombre(String nombre);
}
