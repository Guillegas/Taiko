package com.taiko.backend.service;

import com.taiko.backend.model.Vehiculo;
import com.taiko.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehiculoServiceTest {

    @Mock private VehiculoRepository vehiculoRepository;
    @Mock private VehicleEmbeddingRepository vehicleEmbeddingRepository;
    @Mock private CarroceriaRepository carroceriaRepository;
    @Mock private TransmisionRepository transmisionRepository;
    @Mock private EtiquetaAmbientalRepository etiquetaAmbientalRepository;
    @Mock private CombustibleRepository combustibleRepository;
    @Mock private EquipamientoRepository equipamientoRepository;
    @Mock private ImagenRepository imagenRepository;
    @Mock private EmbeddingModel embeddingModel;
    @Mock private ChatModel chatModel;
    @Mock private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @InjectMocks
    private VehiculoService vehiculoService;

    private UUID vehiculoId;
    private Vehiculo vehiculo;

    @BeforeEach
    void setUp() {
        vehiculoId = UUID.randomUUID();
        vehiculo = new Vehiculo();
        vehiculo.setId(vehiculoId);
        vehiculo.setMarca("Toyota");
        vehiculo.setModelo("Corolla");
        vehiculo.setPrecio(new BigDecimal("22000"));
        vehiculo.setKilometros(50000);
        vehiculo.setDisponible(true);
    }

    @Test
    void getAllVehiculos_returnsList() {
        when(vehiculoRepository.findAll()).thenReturn(List.of(vehiculo));

        List<Vehiculo> result = vehiculoService.getAllVehiculos();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getMarca()).isEqualTo("Toyota");
    }

    @Test
    void getVehiculoById_found_returnsVehiculo() {
        when(vehiculoRepository.findById(vehiculoId)).thenReturn(Optional.of(vehiculo));

        Vehiculo result = vehiculoService.getVehiculoById(vehiculoId);

        assertThat(result.getId()).isEqualTo(vehiculoId);
        assertThat(result.getModelo()).isEqualTo("Corolla");
    }

    @Test
    void getVehiculoById_notFound_throws404() {
        UUID randomId = UUID.randomUUID();
        when(vehiculoRepository.findById(randomId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehiculoService.getVehiculoById(randomId))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void deleteVehiculo_deletesEmbeddingAndVehiculo() {
        when(vehiculoRepository.findById(vehiculoId)).thenReturn(Optional.of(vehiculo));

        vehiculoService.deleteVehiculo(vehiculoId);

        verify(vehicleEmbeddingRepository).deleteByVehiculoId(vehiculoId);
        verify(vehiculoRepository).deleteById(vehiculoId);
    }

    @Test
    void deleteVehiculo_notFound_throws404() {
        UUID randomId = UUID.randomUUID();
        when(vehiculoRepository.findById(randomId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehiculoService.deleteVehiculo(randomId))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));

        verify(vehiculoRepository, never()).deleteById(any());
    }
}
