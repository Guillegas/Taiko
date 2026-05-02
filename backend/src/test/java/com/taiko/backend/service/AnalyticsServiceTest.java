package com.taiko.backend.service;

import com.taiko.backend.model.AnalyticsSummaryDTO;
import com.taiko.backend.model.DatosPorDiaDTO;
import com.taiko.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock private VehiculoRepository vehiculoRepository;
    @Mock private UserRepository userRepository;
    @Mock private ConversacionRepository conversacionRepository;
    @Mock private MensajeRepository mensajeRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    @BeforeEach
    void setUp() {
        when(vehiculoRepository.count()).thenReturn(10L);
        when(userRepository.count()).thenReturn(5L);
        when(conversacionRepository.count()).thenReturn(20L);
        when(mensajeRepository.count()).thenReturn(100L);
        when(conversacionRepository.countConversacionesPorDia(any())).thenReturn(List.of());
        when(userRepository.countUsuariosPorDia(any())).thenReturn(List.of());
        when(conversacionRepository.countPorCanal()).thenReturn(List.of());
        when(mensajeRepository.topVehiculosRecomendados()).thenReturn(List.of());
    }

    @Test
    void getSummary_returnsCorrectKpis() {
        AnalyticsSummaryDTO result = analyticsService.getSummary();

        assertThat(result.getTotalVehiculos()).isEqualTo(10L);
        assertThat(result.getTotalUsuarios()).isEqualTo(5L);
        assertThat(result.getTotalConversaciones()).isEqualTo(20L);
        assertThat(result.getTotalMensajes()).isEqualTo(100L);
    }

    @Test
    void getSummary_serieHasExactly30Days() {
        AnalyticsSummaryDTO result = analyticsService.getSummary();

        assertThat(result.getConversacionesPorDia()).hasSize(30);
        assertThat(result.getUsuariosPorDia()).hasSize(30);
    }

    @Test
    void getSummary_serieEndsToday() {
        AnalyticsSummaryDTO result = analyticsService.getSummary();

        List<DatosPorDiaDTO> serie = result.getConversacionesPorDia();
        String today = LocalDate.now().toString();
        assertThat(serie.get(29).getFecha()).isEqualTo(today);
    }

    @Test
    void getSummary_serieFilledWithZerosWhenNoData() {
        AnalyticsSummaryDTO result = analyticsService.getSummary();

        assertThat(result.getConversacionesPorDia())
                .allMatch(d -> d.getCantidad() == 0L);
    }

    @Test
    void getSummary_mapsCanalesFromObjectArray() {
        Object[] row = new Object[]{"web", 15L};
        when(conversacionRepository.countPorCanal()).thenReturn(List.<Object[]>of(row));

        AnalyticsSummaryDTO result = analyticsService.getSummary();

        assertThat(result.getDistribucionCanales()).hasSize(1);
        assertThat(result.getDistribucionCanales().get(0).getCanal()).isEqualTo("web");
        assertThat(result.getDistribucionCanales().get(0).getCantidad()).isEqualTo(15L);
    }

    @Test
    void getSummary_mapsVehiculosTopFromObjectArray() {
        Object[] row = new Object[]{"Toyota", "Corolla", 7L};
        when(mensajeRepository.topVehiculosRecomendados()).thenReturn(List.<Object[]>of(row));

        AnalyticsSummaryDTO result = analyticsService.getSummary();

        assertThat(result.getVehiculosTop()).hasSize(1);
        assertThat(result.getVehiculosTop().get(0).getMarca()).isEqualTo("Toyota");
        assertThat(result.getVehiculosTop().get(0).getModelo()).isEqualTo("Corolla");
        assertThat(result.getVehiculosTop().get(0).getVeces()).isEqualTo(7L);
    }

    @Test
    void getSummary_serieIncludesRowDataCorrectly() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        Object[] row = new Object[]{Date.valueOf(yesterday), 3L};
        when(conversacionRepository.countConversacionesPorDia(any())).thenReturn(List.<Object[]>of(row));

        AnalyticsSummaryDTO result = analyticsService.getSummary();

        DatosPorDiaDTO yesterdayEntry = result.getConversacionesPorDia().get(28);
        assertThat(yesterdayEntry.getFecha()).isEqualTo(yesterday.toString());
        assertThat(yesterdayEntry.getCantidad()).isEqualTo(3L);
    }
}
