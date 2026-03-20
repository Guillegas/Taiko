package com.taiko.backend.repository;

import com.taiko.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    // Método nativo para forzar la inserción y saltar problemas con el ENUM personalizado de Postgres si los hay
    @org.springframework.data.jpa.repository.Modifying
    @jakarta.transaction.Transactional
    @org.springframework.data.jpa.repository.Query(
        value = "INSERT INTO usuarios (id, nombre, email, password_hash, rol) VALUES (gen_random_uuid(), :nombre, :email, :password, CAST('admin' AS rol_usuario))", 
        nativeQuery = true)
    void insertUserNative(String nombre, String email, String password);
}
