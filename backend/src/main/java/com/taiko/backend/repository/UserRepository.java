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

    @org.springframework.data.jpa.repository.Modifying
    @jakarta.transaction.Transactional
    @org.springframework.data.jpa.repository.Query(
        value = "INSERT INTO usuarios (id, nombre, email, password_hash, telefono, rol) VALUES (gen_random_uuid(), :nombre, :email, :password, :telefono, CAST('cliente' AS rol_usuario))",
        nativeQuery = true)
    void insertUserNativeAsUser(String nombre, String email, String password, String telefono);

    @org.springframework.data.jpa.repository.Modifying
    @jakarta.transaction.Transactional
    @org.springframework.data.jpa.repository.Query(
        value = "UPDATE usuarios SET rol = CAST(:rol AS rol_usuario) WHERE id = :id",
        nativeQuery = true)
    void updateRol(@org.springframework.data.repository.query.Param("id") java.util.UUID id,
                   @org.springframework.data.repository.query.Param("rol") String rol);

    @org.springframework.data.jpa.repository.Modifying
    @jakarta.transaction.Transactional
    @org.springframework.data.jpa.repository.Query(
        value = "UPDATE usuarios SET activo = :activo WHERE id = :id",
        nativeQuery = true)
    void updateActivo(@org.springframework.data.repository.query.Param("id") java.util.UUID id,
                      @org.springframework.data.repository.query.Param("activo") boolean activo);

    // Cuenta usuarios registrados agrupados por día para la serie temporal del dashboard
    @org.springframework.data.jpa.repository.Query(
        value = "SELECT CAST(fecha_registro AS DATE) AS fecha, COUNT(*) AS cantidad " +
                "FROM usuarios WHERE fecha_registro >= :desde " +
                "GROUP BY CAST(fecha_registro AS DATE) ORDER BY fecha ASC",
        nativeQuery = true)
    java.util.List<Object[]> countUsuariosPorDia(@org.springframework.data.repository.query.Param("desde") java.time.LocalDateTime desde);
}
