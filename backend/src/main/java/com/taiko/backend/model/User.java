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

    // updatable = false evita que Hibernate incluya 'rol' en el UPDATE SQL,
    // ya que Postgres no acepta casting automático de varchar a rol_usuario
    @Enumerated(EnumType.STRING)
    @Column(name = "rol", columnDefinition = "rol_usuario", updatable = false)
    private RolUsuario rol = RolUsuario.admin;

    @Column(name = "activo", nullable = false)
    private boolean activo = true;

    public enum RolUsuario {
        admin, cliente
    }
}
