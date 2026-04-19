package com.taiko.backend.model;

public class AdminUserUpdateRequest {
    private String nombre;
    private String email;
    private String telefono;
    private String rol;
    private Boolean activo;

    public String getNombre() { return nombre; }
    public String getEmail() { return email; }
    public String getTelefono() { return telefono; }
    public String getRol() { return rol; }
    public Boolean getActivo() { return activo; }
}
