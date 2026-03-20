package com.taiko.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehiculoBuscadorResponse {
    private Vehiculo vehiculo;
    private Double similitud;
}
