package com.taiko.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Data
@Entity
@Table(name = "usuarios")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String password;

    @Column(name = "telefono")
    private String telefono;

    // Hibernate will try to map Enum.STRING to Postgres custom enum 'rol_usuario'
    @Enumerated(EnumType.STRING)
    @Column(name = "rol", columnDefinition = "rol_usuario")
    private RolUsuario rol = RolUsuario.admin;

    public enum RolUsuario {
        admin, cliente
    }
}
