package com.taiko.backend.controller;

import com.taiko.backend.model.Imagen;
import com.taiko.backend.model.ImagenRequestDTO;
import com.taiko.backend.model.Vehiculo;
import com.taiko.backend.model.VehiculoBuscadorResponse;
import com.taiko.backend.model.VehiculoRequestDTO;
import com.taiko.backend.service.VehiculoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/cars")
public class VehiculoController {

    @Autowired
    private VehiculoService vehiculoService;

    /** Devuelve el catálogo completo de vehículos. */
    @GetMapping
    public ResponseEntity<List<Vehiculo>> getAllVehiculos() {
        return ResponseEntity.ok(vehiculoService.getAllVehiculos());
    }

    /** Devuelve un vehículo por ID o 404 si no existe. */
    @GetMapping("/{id}")
    public ResponseEntity<Vehiculo> getVehiculoById(@PathVariable UUID id) {
        return ResponseEntity.ok(vehiculoService.getVehiculoById(id));
    }

    /** Búsqueda semántica por texto usando embeddings de OpenAI. */
    @PostMapping("/search")
    public ResponseEntity<List<VehiculoBuscadorResponse>> searchVehiculos(
            @RequestBody Map<String, String> payload) {
        String query = payload.get("query");
        if (query == null || query.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(vehiculoService.buscarVehiculosPorTexto(query, 5));
    }

    /** Crea un nuevo vehículo con sus datos y genera su embedding. Solo admin. */
    @PostMapping("/new")
    public ResponseEntity<Vehiculo> createVehiculo(@RequestBody VehiculoRequestDTO vehiculoDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehiculoService.createVehiculo(vehiculoDTO));
    }

    /** Actualiza los datos de un vehículo existente. Solo admin. */
    @PutMapping("/{id}")
    public ResponseEntity<Vehiculo> updateVehiculo(@PathVariable UUID id,
                                                   @RequestBody VehiculoRequestDTO vehiculoDetailsDTO) {
        return ResponseEntity.ok(vehiculoService.updateVehiculo(id, vehiculoDetailsDTO));
    }

    /** Añade imágenes a un vehículo. Solo admin. */
    @PostMapping("/{id}/images")
    public ResponseEntity<List<Imagen>> addImages(@PathVariable UUID id,
                                                  @RequestBody List<ImagenRequestDTO> imagenesDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehiculoService.addImagesToVehiculo(id, imagenesDTO));
    }

    /** Elimina un vehículo y sus imágenes y embeddings asociados. Solo admin. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehiculo(@PathVariable UUID id) {
        vehiculoService.deleteVehiculo(id);
        return ResponseEntity.noContent().build();
    }

    /** Genera una descripción comercial con IA a partir de los datos básicos del vehículo. Solo admin. */
    @PostMapping("/generate-description")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<Map<String, String>> generateDescription(@RequestBody Map<String, String> payload) {
        String descripcion = vehiculoService.generarDescripcion(
                payload.get("marca"),
                payload.get("modelo"),
                payload.get("version"),
                payload.get("precio"),
                payload.get("color"),
                payload.get("kilometros")
        );
        return ResponseEntity.ok(Map.of("descripcion", descripcion));
    }

    /**
     * Genera embeddings para vehículos que no los tengan. Solo admin.
     * Útil tras importaciones masivas directas en BD.
     */
    @PostMapping("/seed")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<String> seedEmbeddings() {
        return ResponseEntity.ok(vehiculoService.seedVehicles());
    }

    /**
     * Importación masiva desde CSV o Excel (.xlsx). Solo admin.
     * El archivo debe incluir cabeceras con los campos del vehículo.
     */
    @PostMapping("/import")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<String> importVehicles(@RequestParam("file") MultipartFile file) {
        String nombre = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        String resultado = nombre.endsWith(".xlsx")
                ? vehiculoService.importVehiclesFromExcel(file)
                : vehiculoService.importVehiclesFromCsv(file);
        return ResponseEntity.ok(resultado);
    }
}
