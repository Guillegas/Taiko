package com.taiko.backend.controller;

import com.taiko.backend.model.Vehiculo;
import com.taiko.backend.model.VehiculoRequestDTO;
import com.taiko.backend.model.Imagen;
import com.taiko.backend.model.ImagenRequestDTO;
import com.taiko.backend.model.VehiculoBuscadorResponse;
import com.taiko.backend.service.VehiculoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cars")
@CrossOrigin(origins = "*") // Permite conexiones desde el frontend React
public class VehiculoController {

    @Autowired
    private VehiculoService vehiculoService;

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/cars
    // Devuelve la lista completa de vehículos
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<Vehiculo>> getAllVehiculos() {
        return ResponseEntity.ok(vehiculoService.getAllVehiculos());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/cars/{id}
    // Devuelve un vehículo concreto o 404 si no existe
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<Vehiculo> getVehiculoById(@PathVariable UUID id) {
        return ResponseEntity.ok(vehiculoService.getVehiculoById(id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/cars/new
    // Crea un nuevo vehículo → devuelve 201 Created con el objeto guardado
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/new")
    public ResponseEntity<Vehiculo> createVehiculo(@RequestBody VehiculoRequestDTO vehiculoDTO) {
        Vehiculo created = vehiculoService.createVehiculo(vehiculoDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/cars/{id}
    // Actualiza los campos del vehículo con el id indicado → devuelve 200 OK
    // ─────────────────────────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<Vehiculo> updateVehiculo(@PathVariable UUID id,
                                                    @RequestBody VehiculoRequestDTO vehiculoDetailsDTO) {
        return ResponseEntity.ok(vehiculoService.updateVehiculo(id, vehiculoDetailsDTO));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/cars/{id}/images
    // Añade lista de imágenes a un vehículo
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/{id}/images")
    public ResponseEntity<List<Imagen>> addImagesToVehiculo(@PathVariable UUID id,
                                                            @RequestBody List<ImagenRequestDTO> imagenesDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehiculoService.addImagesToVehiculo(id, imagenesDTO));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /api/cars/{id}
    // Elimina el vehículo con el id indicado → devuelve 204 No Content
    // ─────────────────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehiculo(@PathVariable UUID id) {
        vehiculoService.deleteVehiculo(id);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/cars/search (Debería ser un POST o GET con Query Param)
    // Usa POST para enviar textos largos o complejos en el body
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/search")
    public ResponseEntity<List<com.taiko.backend.model.VehiculoBuscadorResponse>> searchVehiculos(
            @RequestBody java.util.Map<String, String> payload) {
        
        String textoBusqueda = payload.get("query");
        if (textoBusqueda == null || textoBusqueda.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Recuperamos un máximo de 5 coches coincidentes por defecto
        List<com.taiko.backend.model.VehiculoBuscadorResponse> resultados = 
                vehiculoService.buscarVehiculosPorTexto(textoBusqueda, 5);
                
        return ResponseEntity.ok(resultados);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/cars/seed
    // Poblar la base de datos con coches de ejemplo funcionales (con embeddings)
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/seed")
    public ResponseEntity<String> seedDatabase() {
        String mensaje = vehiculoService.seedVehicles();
        return ResponseEntity.ok(mensaje);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/cars/import
    // Sube un archivo CSV o Excel (.xlsx) y carga múltiples vehículos en masa.
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/import")
    public ResponseEntity<String> importVehicles(@RequestParam("file") MultipartFile file) {
        String nombre = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        String resultado;
        if (nombre.endsWith(".xlsx")) {
            resultado = vehiculoService.importVehiclesFromExcel(file);
        } else {
            resultado = vehiculoService.importVehiclesFromCsv(file);
        }
        return ResponseEntity.ok(resultado);
    }
}
