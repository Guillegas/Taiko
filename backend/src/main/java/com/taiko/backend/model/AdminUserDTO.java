package com.taiko.backend.model;

import java.util.UUID;

public class AdminUserDTO {
    private UUID id;
    private String nombre;
    private String email;
    private String telefono;
    private String rol;
    private boolean activo;

    public AdminUserDTO(UUID id, String nombre, String email, String telefono, String rol, boolean activo) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.telefono = telefono;
        this.rol = rol;
        this.activo = activo;
    }

    public UUID getId() { return id; }
    public String getNombre() { return nombre; }
    public String getEmail() { return email; }
    public String getTelefono() { return telefono; }
    public String getRol() { return rol; }
    public boolean isActivo() { return activo; }
}
