package com.taiko.backend.repository;

import com.taiko.backend.model.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface VehiculoRepository extends JpaRepository<Vehiculo, UUID> {
    // Spring Data JPA ya te regala métodos como findAll(), findById(), save(), deleteById(), etc.
}
