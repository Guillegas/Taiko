package com.taiko.backend.repository;

import com.taiko.backend.model.EtiquetaAmbiental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EtiquetaAmbientalRepository extends JpaRepository<EtiquetaAmbiental, Integer> {
    EtiquetaAmbiental findByNombre(String nombre);
}
