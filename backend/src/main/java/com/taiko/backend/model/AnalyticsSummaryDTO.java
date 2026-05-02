package com.taiko.backend.model;

import java.util.List;

public class AnalyticsSummaryDTO {
    private long totalVehiculos;
    private long totalUsuarios;
    private long totalConversaciones;
    private long totalMensajes;
    private List<DatosPorDiaDTO> conversacionesPorDia;
    private List<DatosPorDiaDTO> usuariosPorDia;
    private List<DistribucionCanalDTO> distribucionCanales;
    private List<VehiculoTopDTO> vehiculosTop;

    public AnalyticsSummaryDTO(long totalVehiculos, long totalUsuarios,
                               long totalConversaciones, long totalMensajes,
                               List<DatosPorDiaDTO> conversacionesPorDia,
                               List<DatosPorDiaDTO> usuariosPorDia,
                               List<DistribucionCanalDTO> distribucionCanales,
                               List<VehiculoTopDTO> vehiculosTop) {
        this.totalVehiculos = totalVehiculos;
        this.totalUsuarios = totalUsuarios;
        this.totalConversaciones = totalConversaciones;
        this.totalMensajes = totalMensajes;
        this.conversacionesPorDia = conversacionesPorDia;
        this.usuariosPorDia = usuariosPorDia;
        this.distribucionCanales = distribucionCanales;
        this.vehiculosTop = vehiculosTop;
    }

    public long getTotalVehiculos() { return totalVehiculos; }
    public long getTotalUsuarios() { return totalUsuarios; }
    public long getTotalConversaciones() { return totalConversaciones; }
    public long getTotalMensajes() { return totalMensajes; }
    public List<DatosPorDiaDTO> getConversacionesPorDia() { return conversacionesPorDia; }
    public List<DatosPorDiaDTO> getUsuariosPorDia() { return usuariosPorDia; }
    public List<DistribucionCanalDTO> getDistribucionCanales() { return distribucionCanales; }
    public List<VehiculoTopDTO> getVehiculosTop() { return vehiculosTop; }
}
