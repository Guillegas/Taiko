package com.taiko.backend.service;

import com.taiko.backend.model.Vehiculo;
import com.taiko.backend.model.VehiculoRequestDTO;
import com.taiko.backend.repository.VehicleEmbeddingRepository;
import com.taiko.backend.repository.VehiculoRepository;
import com.taiko.backend.repository.CarroceriaRepository;
import com.taiko.backend.repository.TransmisionRepository;
import com.taiko.backend.repository.EtiquetaAmbientalRepository;
import com.taiko.backend.repository.CombustibleRepository;
import com.taiko.backend.repository.EquipamientoRepository;
import com.taiko.backend.repository.ImagenRepository;
import com.taiko.backend.model.Imagen;
import com.taiko.backend.model.ImagenRequestDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VehiculoService {

    private static final Logger log = LoggerFactory.getLogger(VehiculoService.class);

    @Autowired
    private VehiculoRepository vehiculoRepository;

    @Autowired
    private VehicleEmbeddingRepository vehicleEmbeddingRepository;
    
    @Autowired
    private CarroceriaRepository carroceriaRepository;
    
    @Autowired
    private TransmisionRepository transmisionRepository;
    
    @Autowired
    private EtiquetaAmbientalRepository etiquetaAmbientalRepository;
    
    @Autowired
    private CombustibleRepository combustibleRepository;
    
    @Autowired
    private EquipamientoRepository equipamientoRepository;

    @Autowired
    private ImagenRepository imagenRepository;

    @Autowired
    private EmbeddingModel embeddingModel;

    @Autowired
    private org.springframework.ai.chat.model.ChatModel chatModel;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    private static final String MODELO_IA = "text-embedding-3-small";

    /**
     * Devuelve todos los vehículos de la base de datos.
     */
    public List<Vehiculo> getAllVehiculos() {
        return vehiculoRepository.findAll();
    }

    /**
     * Devuelve un vehículo por su UUID.
     * Lanza 404 Not Found si no existe.
     */
    public Vehiculo getVehiculoById(UUID id) {
        return vehiculoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Vehículo no encontrado con id: " + id));
    }

    /**
     * Crea un nuevo vehículo y genera automáticamente su embedding con OpenAI,
     * procesando sus relaciones.
     */
    public Vehiculo createVehiculo(VehiculoRequestDTO dto) {
        Vehiculo vehiculo = new Vehiculo();
        
        // Mapeo básico
        vehiculo.setMarca(dto.getMarca());
        vehiculo.setModelo(dto.getModelo());
        vehiculo.setVersion(dto.getVersion());
        vehiculo.setVin(dto.getVin());
        vehiculo.setAnio(dto.getAnio() != null ? dto.getAnio() : 2024);
        vehiculo.setKilometros(dto.getKilometros());
        vehiculo.setPrecio(dto.getPrecio() != null ? dto.getPrecio() : java.math.BigDecimal.ZERO);
        vehiculo.setColor(dto.getColor());
        vehiculo.setDescripcion(dto.getDescripcion());
        vehiculo.setDisponible(dto.getDisponible() != null ? dto.getDisponible() : true);
        
        mapRelations(vehiculo, dto);

        // Guardar primero el vehículo para obtener el UUID generado
        Vehiculo savedVehiculo = vehiculoRepository.save(vehiculo);

        // Construir el texto descriptivo para el embedding
        String texto = buildTextoEmbedding(savedVehiculo);

        // Llamar a OpenAI para generar el embedding
        float[] vector = embeddingModel.embed(texto);

        // Convertir y persistir
        String vectorString = toVectorString(vector);
        vehicleEmbeddingRepository.insertEmbedding(
                savedVehiculo.getId(),
                texto,
                MODELO_IA,
                vectorString
        );

        return savedVehiculo;
    }

    /**
     * Actualiza los campos permitidos de un vehículo existente usando el DTO.
     */
    public Vehiculo updateVehiculo(UUID id, VehiculoRequestDTO dto) {
        Vehiculo vehiculo = getVehiculoById(id);

        if (dto.getMarca() != null)       vehiculo.setMarca(dto.getMarca());
        if (dto.getModelo() != null)      vehiculo.setModelo(dto.getModelo());
        if (dto.getVersion() != null)     vehiculo.setVersion(dto.getVersion());
        if (dto.getVin() != null)         vehiculo.setVin(dto.getVin());
        if (dto.getAnio() != null)        vehiculo.setAnio(dto.getAnio());
        if (dto.getKilometros() != null)  vehiculo.setKilometros(dto.getKilometros());
        if (dto.getPrecio() != null)      vehiculo.setPrecio(dto.getPrecio());
        if (dto.getColor() != null)       vehiculo.setColor(dto.getColor());
        if (dto.getDescripcion() != null) vehiculo.setDescripcion(dto.getDescripcion());
        if (dto.getDisponible() != null)  vehiculo.setDisponible(dto.getDisponible());
        
        mapRelations(vehiculo, dto);

        Vehiculo updatedVehiculo = vehiculoRepository.save(vehiculo);
        
        // Recalcular el embedding porque han cambiado los datos
        String texto = buildTextoEmbedding(updatedVehiculo);
        float[] vector = embeddingModel.embed(texto);
        String vectorString = toVectorString(vector);
        vehicleEmbeddingRepository.insertEmbedding(updatedVehiculo.getId(), texto, MODELO_IA, vectorString);
        
        return updatedVehiculo;
    }
    
    private void mapRelations(Vehiculo vehiculo, VehiculoRequestDTO dto) {
        if (dto.getCarroceriaId() != null) {
            carroceriaRepository.findById(dto.getCarroceriaId()).ifPresent(vehiculo::setCarroceria);
        }
        if (dto.getTransmisionId() != null) {
            transmisionRepository.findById(dto.getTransmisionId()).ifPresent(vehiculo::setTransmision);
        }
        if (dto.getEtiquetaAmbientalId() != null) {
            etiquetaAmbientalRepository.findById(dto.getEtiquetaAmbientalId()).ifPresent(vehiculo::setEtiquetaAmbiental);
        }
        if (dto.getCombustibleIds() != null) {
            vehiculo.setCombustibles(combustibleRepository.findAllById(dto.getCombustibleIds()));
        }
        if (dto.getEquipamientoIds() != null) {
            vehiculo.setEquipamiento(equipamientoRepository.findAllById(dto.getEquipamientoIds()));
        }
    }

    /**
     * Añade una lista de imágenes a un vehículo existente.
     */
    public List<Imagen> addImagesToVehiculo(UUID id, List<ImagenRequestDTO> imagenesDTO) {
        Vehiculo vehiculo = getVehiculoById(id);
        
        List<Imagen> nuevasImagenes = imagenesDTO.stream().map(dto -> {
            Imagen img = new Imagen();
            img.setUrl(dto.getUrl());
            img.setEsPrincipal(dto.getEsPrincipal() != null ? dto.getEsPrincipal() : false);
            img.setVehiculo(vehiculo);
            return img;
        }).collect(Collectors.toList());
        
        return imagenRepository.saveAll(nuevasImagenes);
    }

    /**
     * Elimina un vehículo por su UUID.
     * Lanza 404 Not Found si no existe antes de intentar borrar.
     */
    public void deleteVehiculo(UUID id) {
        getVehiculoById(id);
        vehicleEmbeddingRepository.deleteByVehiculoId(id);
        vehiculoRepository.deleteById(id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BUSCADOR SEMÁNTICO (SPRING AI + PGVECTOR)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Búsqueda vectorial pura: convierte la query a embedding y devuelve los vehículos
     * disponibles más similares. Usada por el chat para inyectar contexto RAG.
     */
    public List<Vehiculo> buscarVehiculosRelevantes(String query, int limite) {
        float[] vector = embeddingModel.embed(query);
        String vectorString = toVectorString(vector);
        return vehicleEmbeddingRepository.searchSimilarVehicles(vectorString, limite)
                .stream()
                .map(row -> getVehiculoById((UUID) row[0]))
                .filter(v -> Boolean.TRUE.equals(v.getDisponible()))
                .collect(Collectors.toList());
    }

    /**
     * Busca los vehículos combinando búsqueda semántica (vectores) y un
     * filtro estricto con LLM para asegurar que se cumplen criterios como precio o color.
     */
    public List<com.taiko.backend.model.VehiculoBuscadorResponse> buscarVehiculosPorTexto(String textoBusqueda, int limite) {
        // 1. Convertir el texto de búsqueda a vector usando OpenAI
        float[] vector = embeddingModel.embed(textoBusqueda);
        String vectorString = toVectorString(vector);

        // 2. Traer un buen puñado de candidatos (ej. los 15 más similares) para no quedarnos cortos
        List<Object[]> resultadosRaw = vehicleEmbeddingRepository.searchSimilarVehicles(vectorString, 15);

        // 3. Mapear candidatos a objetos Vehiculo
        List<com.taiko.backend.model.VehiculoBuscadorResponse> precandidatos = resultadosRaw.stream().map(row -> {
            UUID vehiculoId = (UUID) row[0];
            Double distancia = ((Number) row[1]).doubleValue();
            double similitud = (1.0 - (distancia / 2.0)) * 100.0;
            Vehiculo v = getVehiculoById(vehiculoId);
            return new com.taiko.backend.model.VehiculoBuscadorResponse(v, similitud);
        }).collect(Collectors.toList());

        if (precandidatos.isEmpty()) {
            return precandidatos;
        }

        // 4. Usar el ChatModel (LLM) como "Juez" para filtrar estrictamente
        try {
            // Preparamos un JSON simple con los candidatos
            List<java.util.Map<String, Object>> candidatosJson = precandidatos.stream().map(p -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", p.getVehiculo().getId().toString());
                map.put("marca_modelo", p.getVehiculo().getMarca() + " " + p.getVehiculo().getModelo());
                map.put("precio", p.getVehiculo().getPrecio());
                map.put("color", p.getVehiculo().getColor());
                map.put("descripcion", p.getVehiculo().getDescripcion());
                return map;
            }).toList();

            String jsonCandidatos = objectMapper.writeValueAsString(candidatosJson);

            String prompt = String.format("""
                Eres un asistente estricto de un concesionario de coches.
                El usuario ha pedido: "%s"
                
                Aquí tienes una lista de coches candidatos en formato JSON:
                %s
                
                Tu tarea es filtrar esta lista rígidamente. 
                - Si el usuario pide un color específico, elimina los que no encajen.
                - Si pide un límite de precio, elimina los que se pasen.
                - Si no hay ninguno que cumpla estrictamente lo que pide, devuelve un array vacío [].
                
                IMPORTANTE: Devuelve ÚNICAMENTE un array JSON válido y plano con los IDs (strings) de los coches aprobados. 
                Ejemplo de respuesta permitida: ["uuid1", "uuid2"]
                No escribas nada más, ni explicaciones, ni markdown.
                """, textoBusqueda, jsonCandidatos);

            String respuestaLlm = chatModel.call(prompt).trim();
            
            // Limpiar posible código markdown (```json ... ```) si la IA lo devuelve
            if (respuestaLlm.startsWith("```")) {
                respuestaLlm = respuestaLlm.replaceAll("```json", "").replaceAll("```", "").trim();
            }

            // Parsear la lista de UUIDs válidos
            List<String> validIds = objectMapper.readValue(respuestaLlm, new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});

            // 5. Devolver solo los vehículos que la IA validó, hasta el límite solicitado
            return precandidatos.stream()
                    .filter(p -> validIds.contains(p.getVehiculo().getId().toString()))
                    .limit(limite)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            // Si el LLM falla, fallback conservador filtrando por umbral de similitud
            log.warn("Filtro LLM fallido, aplicando fallback por similitud: {}", e.getMessage());
            return precandidatos.stream()
                .filter(p -> p.getSimilitud() > 65.0)
                .limit(limite)
                .collect(Collectors.toList());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POBLAR BASE DE DATOS (SEEDER)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Re-calcula embeddings para coches existentes sin ellos y crea nuevos de ejemplo.
     */
    public String seedVehicles() {
        // 1. Recalcular para los existentes (borramos los viejos por si acaso y los rehacemos)
        List<Vehiculo> existentes = getAllVehiculos();
        int recalculados = 0;
        for (Vehiculo v : existentes) {
            String texto = buildTextoEmbedding(v);
            float[] vector = embeddingModel.embed(texto);
            String vectorString = toVectorString(vector);
            
            vehicleEmbeddingRepository.deleteByVehiculoId(v.getId());
            vehicleEmbeddingRepository.insertEmbedding(v.getId(), texto, MODELO_IA, vectorString);
            recalculados++;
        }

        // 2. Crear 10 coches de ejemplo muy variados
        VehiculoRequestDTO v1 = new VehiculoRequestDTO(); v1.setMarca("SEAT"); v1.setModelo("Ibiza"); v1.setVersion("FR"); v1.setPrecio(new java.math.BigDecimal("18000")); v1.setKilometros(25000); v1.setColor("Rojo"); v1.setDescripcion("Coche compacto, muy ágil para la ciudad y fácil de aparcar. Consumo bajo ideal para gente joven.");
        VehiculoRequestDTO v2 = new VehiculoRequestDTO(); v2.setMarca("Peugeot"); v2.setModelo("3008"); v2.setVersion("GT Line"); v2.setPrecio(new java.math.BigDecimal("29500")); v2.setKilometros(12000); v2.setColor("Blanco"); v2.setDescripcion("SUV familiar de gran tamaño. Maletero muy amplio, ideal para viajes largos con toda la familia cómodamente.");
        VehiculoRequestDTO v3 = new VehiculoRequestDTO(); v3.setMarca("Tesla"); v3.setModelo("Model 3"); v3.setVersion("Long Range"); v3.setPrecio(new java.math.BigDecimal("45000")); v3.setKilometros(5000); v3.setColor("Negro"); v3.setDescripcion("Vehículo 100% eléctrico. Cero emisiones, aceleración brutal y tecnología punta con Autopilot. Perfecto si tienes cargador en casa.");
        VehiculoRequestDTO v4 = new VehiculoRequestDTO(); v4.setMarca("Porsche"); v4.setModelo("911"); v4.setVersion("Carrera 4S"); v4.setPrecio(new java.math.BigDecimal("145000")); v4.setKilometros(30000); v4.setColor("Plata"); v4.setDescripcion("Deportivo clásico de lujo. Altas prestaciones, motor potente y una experiencia de conducción inigualable. Para los amantes de la velocidad.");
        VehiculoRequestDTO v5 = new VehiculoRequestDTO(); v5.setMarca("Toyota"); v5.setModelo("Corolla"); v5.setVersion("Advance"); v5.setPrecio(new java.math.BigDecimal("24000")); v5.setKilometros(60000); v5.setColor("Azul"); v5.setDescripcion("Híbrido súper fiable. Etiqueta ECO de la DGT, no gasta casi nada en ciudad y su mantenimiento es muy barato. Muy buena inversión.");
        VehiculoRequestDTO v6 = new VehiculoRequestDTO(); v6.setMarca("Dacia"); v6.setModelo("Sandero"); v6.setVersion("Stepway"); v6.setPrecio(new java.math.BigDecimal("14000")); v6.setKilometros(500); v6.setColor("Naranja"); v6.setDescripcion("El coche más barato y práctico. Km0 casi a estrenar. Tiene aspecto de crossover y te lleva del punto A al B sin gastar mucho dinero.");
        VehiculoRequestDTO v7 = new VehiculoRequestDTO(); v7.setMarca("Mercedes-Benz"); v7.setModelo("Clase G"); v7.setVersion("G 63 AMG"); v7.setPrecio(new java.math.BigDecimal("180000")); v7.setKilometros(15000); v7.setColor("Negro Mate"); v7.setDescripcion("Todoterreno 4x4 puro y muy lujoso. Fuerza bruta, sonido espectacular del motor V8 y capacidades off-road extremas.");
        VehiculoRequestDTO v8 = new VehiculoRequestDTO(); v8.setMarca("Kia"); v8.setModelo("Sportage"); v8.setVersion("Drive"); v8.setPrecio(new java.math.BigDecimal("27000")); v8.setKilometros(10); v8.setColor("Blanco Perla"); v8.setDescripcion("SUV mediano familiar, espacioso y con 7 años de garantía. A estrenar, directo de concesionario. Muy seguro y tecnológico.");
        VehiculoRequestDTO v9 = new VehiculoRequestDTO(); v9.setMarca("Fiat"); v9.setModelo("500"); v9.setVersion("Lounge"); v9.setPrecio(new java.math.BigDecimal("12000")); v9.setKilometros(45000); v9.setColor("Menta"); v9.setDescripcion("Coche urbanato con mucho estilo y diseño italiano. Muy pequeño para meterlo en cualquier hueco en el centro de la ciudad.");
        VehiculoRequestDTO v10 = new VehiculoRequestDTO(); v10.setMarca("Volvo"); v10.setModelo("XC90"); v10.setVersion("Momentum"); v10.setPrecio(new java.math.BigDecimal("55000")); v10.setKilometros(80000); v10.setColor("Gris Oscuro"); v10.setDescripcion("SUV enorme y premium. Tiene 7 plazas, perfecto para familias numerosas. Es probablemente uno de los coches más seguros del mundo.");

        createVehiculo(v1); createVehiculo(v2); createVehiculo(v3); createVehiculo(v4); createVehiculo(v5);
        createVehiculo(v6); createVehiculo(v7); createVehiculo(v8); createVehiculo(v9); createVehiculo(v10);

        return String.format("Seeding completado. Se generaron embeddings para %d coches existentes y se crearon 10 nuevos de ejemplo.", recalculados);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Métodos de ayuda (privados)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Construye el texto descriptivo que se enviará a OpenAI para generar el embedding.
     * Cuanto más rico sea el texto, mejor será la búsqueda semántica posterior.
     */
    private String buildTextoEmbedding(Vehiculo v) {
        String precioStr = v.getPrecio() != null ? v.getPrecio().toPlainString() : "precio a consultar";
        String kmsStr = v.getKilometros() != null ? String.valueOf(v.getKilometros()) : "0";
        
        String carroceriaStr = v.getCarroceria() != null ? v.getCarroceria().getNombre() : "";
        String transmisionStr = v.getTransmision() != null ? v.getTransmision().getNombre() : "";
        String etiquetaStr = v.getEtiquetaAmbiental() != null ? v.getEtiquetaAmbiental().getNombre() : "";
        
        String combustiblesStr = v.getCombustibles() != null ? 
            v.getCombustibles().stream().map(c -> c.getNombre()).collect(Collectors.joining(", ")) : "";
            
        String equipamientoStr = v.getEquipamiento() != null ? 
            v.getEquipamiento().stream().map(e -> e.getNombre()).collect(Collectors.joining(", ")) : "";
        
        return String.format(
                "Marca: %s. Modelo: %s. Versión: %s. Carrocería: %s. Transmisión: %s. Combustible: %s. Etiqueta: %s. " +
                "Precio: %s euros. Color: %s. Kilometraje: %s km. Extras: %s. Descripción: %s",
                nullSafe(v.getMarca()),
                nullSafe(v.getModelo()),
                nullSafe(v.getVersion()),
                carroceriaStr,
                transmisionStr,
                combustiblesStr,
                etiquetaStr,
                precioStr,
                nullSafe(v.getColor()),
                kmsStr,
                equipamientoStr,
                nullSafe(v.getDescripcion())
        );
    }

    /**
     * Convierte float[] → "[0.123, 0.456, ...]" (formato esperado por pgvector).
     */
    private String toVectorString(float[] vector) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            sb.append(vector[i]);
            if (i < vector.length - 1) {
                sb.append(",");
            }
        }
        sb.append("]");
        return sb.toString();
    }

    private String nullSafe(String value) {
        return value != null ? value : "";
    }

    /**
     * Importación masiva de vehículos desde un archivo CSV.
     * Formato esperado: Marca,Modelo,Version,Precio,Kilometros,Color,Descripcion,CarroceriaId
     */
    public String importVehiclesFromCsv(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo CSV está vacío.");
        }

        int exitosos = 0;
        int fallidos = 0;

        try (Reader reader = new InputStreamReader(file.getInputStream());
             CSVReader csvReader = new CSVReader(reader)) {

            String[] line;
            boolean firstLine = true;

            while ((line = csvReader.readNext()) != null) {
                if (firstLine) {
                    firstLine = false; // Saltar cabecera
                    continue;
                }

                try {
                    // Mapeo básico asumiendo columnas: Marca(0), Modelo(1), Version(2), Precio(3), Kilometros(4), Color(5), Descripcion(6), CarroceriaId(7)
                    if (line.length < 7) {
                        fallidos++;
                        continue; // Saltar fila incompleta
                    }

                    VehiculoRequestDTO dto = new VehiculoRequestDTO();
                    dto.setMarca(line[0].trim());
                    dto.setModelo(line[1].trim());
                    dto.setVersion(line[2].trim());
                    
                    try {
                        dto.setPrecio(new BigDecimal(line[3].trim()));
                    } catch (NumberFormatException e) {
                        dto.setPrecio(BigDecimal.ZERO);
                    }
                    
                    try {
                        dto.setKilometros(Integer.parseInt(line[4].trim()));
                    } catch (NumberFormatException e) {
                        dto.setKilometros(0);
                    }
                    
                    dto.setColor(line[5].trim());
                    dto.setDescripcion(line[6].trim());
                    
                    if (line.length >= 8 && !line[7].trim().isEmpty()) {
                        try {
                            dto.setCarroceriaId(Integer.parseInt(line[7].trim()));
                        } catch (NumberFormatException e) {
                            // ignorar si no es un número válido
                        }
                    }

                    // Reutilizamos logic core para relacionales + embeddings
                    createVehiculo(dto);
                    exitosos++;

                } catch (Exception e) {
                    log.warn("Error procesando fila CSV [{}]: {}", String.join(",", line), e.getMessage());
                    fallidos++;
                }
            }

        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error general leyendo el archivo CSV: " + e.getMessage());
        }

        return String.format("Importación completada. Exitosos: %d, Fallidos: %d", exitosos, fallidos);
    }

    /**
     * Importación masiva de vehículos desde un archivo Excel (.xlsx).
     * Formato esperado (mismas columnas que CSV):
     * Marca | Modelo | Version | Precio | Kilometros | Color | Descripcion | CarroceriaId
     */
    public String importVehiclesFromExcel(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo Excel está vacío.");
        }

        int exitosos = 0;
        int fallidos = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            boolean firstRow = true;

            for (Row row : sheet) {
                if (firstRow) {
                    firstRow = false; // Saltar cabecera
                    continue;
                }
                if (row == null) continue;

                try {
                    String marca = getCellString(row, 0);
                    String modelo = getCellString(row, 1);
                    String version = getCellString(row, 2);
                    String precioStr = getCellString(row, 3);
                    String kmStr = getCellString(row, 4);
                    String color = getCellString(row, 5);
                    String descripcion = getCellString(row, 6);
                    String carroceriaIdStr = getCellString(row, 7);

                    if (marca.isEmpty() && modelo.isEmpty()) continue;

                    VehiculoRequestDTO dto = new VehiculoRequestDTO();
                    dto.setMarca(marca);
                    dto.setModelo(modelo);
                    dto.setVersion(version);
                    dto.setColor(color);
                    dto.setDescripcion(descripcion);

                    try { dto.setPrecio(new BigDecimal(precioStr)); }
                    catch (NumberFormatException e) { dto.setPrecio(BigDecimal.ZERO); }

                    try { dto.setKilometros(Integer.parseInt(kmStr)); }
                    catch (NumberFormatException e) { dto.setKilometros(0); }

                    if (!carroceriaIdStr.isEmpty()) {
                        try { dto.setCarroceriaId(Integer.parseInt(carroceriaIdStr)); }
                        catch (NumberFormatException ignored) {}
                    }

                    createVehiculo(dto);
                    exitosos++;

                } catch (Exception e) {
                    log.warn("Error procesando fila Excel: {}", e.getMessage());
                    fallidos++;
                }
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error leyendo el archivo Excel: " + e.getMessage());
        }

        return String.format("Importación completada. Exitosos: %d, Fallidos: %d", exitosos, fallidos);
    }

    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) yield "";
                double val = cell.getNumericCellValue();
                yield val == Math.floor(val) ? String.valueOf((long) val) : String.valueOf(val);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }
}
