package com.taiko.backend.repository;

import com.taiko.backend.model.Combustible;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CombustibleRepository extends JpaRepository<Combustible, Integer> {
    Combustible findByNombre(String nombre);
}
