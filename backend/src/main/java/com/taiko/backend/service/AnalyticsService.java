package com.taiko.backend.service;

import com.taiko.backend.model.*;
import com.taiko.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AnalyticsService {

    @Autowired private VehiculoRepository vehiculoRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ConversacionRepository conversacionRepository;
    @Autowired private MensajeRepository mensajeRepository;

    /** Devuelve todos los datos del dashboard en una sola llamada. */
    public AnalyticsSummaryDTO getSummary() {
        long totalVehiculos = vehiculoRepository.count();
        long totalUsuarios = userRepository.count();
        long totalConversaciones = conversacionRepository.count();
        long totalMensajes = mensajeRepository.count();

        // Inicio del período: hace 29 días a las 00:00 para cubrir exactamente 30 días
        LocalDateTime desde = LocalDate.now().minusDays(29).atStartOfDay();

        List<DatosPorDiaDTO> conversacionesPorDia = buildSerie(
                conversacionRepository.countConversacionesPorDia(desde));

        List<DatosPorDiaDTO> usuariosPorDia = buildSerie(
                userRepository.countUsuariosPorDia(desde));

        List<DistribucionCanalDTO> distribucionCanales = new ArrayList<>();
        for (Object[] row : conversacionRepository.countPorCanal()) {
            distribucionCanales.add(new DistribucionCanalDTO(
                    (String) row[0],
                    ((Number) row[1]).longValue()));
        }

        List<VehiculoTopDTO> vehiculosTop = new ArrayList<>();
        for (Object[] row : mensajeRepository.topVehiculosRecomendados()) {
            vehiculosTop.add(new VehiculoTopDTO(
                    (String) row[0],
                    (String) row[1],
                    ((Number) row[2]).longValue()));
        }

        return new AnalyticsSummaryDTO(
                totalVehiculos, totalUsuarios, totalConversaciones, totalMensajes,
                conversacionesPorDia, usuariosPorDia, distribucionCanales, vehiculosTop);
    }

    /** Genera una serie de 30 días completa, rellenando con 0 los días sin actividad. */
    private List<DatosPorDiaDTO> buildSerie(List<Object[]> rows) {
        Map<LocalDate, Long> rawMap = new HashMap<>();
        for (Object[] row : rows) {
            LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
            rawMap.put(date, ((Number) row[1]).longValue());
        }

        List<DatosPorDiaDTO> serie = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 29; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            serie.add(new DatosPorDiaDTO(day.toString(), rawMap.getOrDefault(day, 0L)));
        }
        return serie;
    }
}
