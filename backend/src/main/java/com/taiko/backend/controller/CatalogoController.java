package com.taiko.backend.controller;

import com.taiko.backend.model.Carroceria;
import com.taiko.backend.model.Combustible;
import com.taiko.backend.model.Equipamiento;
import com.taiko.backend.model.EtiquetaAmbiental;
import com.taiko.backend.model.Transmision;
import com.taiko.backend.repository.CarroceriaRepository;
import com.taiko.backend.repository.CombustibleRepository;
import com.taiko.backend.repository.EquipamientoRepository;
import com.taiko.backend.repository.EtiquetaAmbientalRepository;
import com.taiko.backend.repository.TransmisionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo")
@CrossOrigin(origins = "*")
public class CatalogoController {

    @Autowired private CarroceriaRepository carroceriaRepository;
    @Autowired private TransmisionRepository transmisionRepository;
    @Autowired private CombustibleRepository combustibleRepository;
    @Autowired private EquipamientoRepository equipamientoRepository;
    @Autowired private EtiquetaAmbientalRepository etiquetaAmbientalRepository;

    @GetMapping("/carrocerias")
    public List<Carroceria> getCarrocerias() {
        return carroceriaRepository.findAll();
    }

    @GetMapping("/transmisiones")
    public List<Transmision> getTransmisiones() {
        return transmisionRepository.findAll();
    }

    @GetMapping("/combustibles")
    public List<Combustible> getCombustibles() {
        return combustibleRepository.findAll();
    }

    @GetMapping("/equipamiento")
    public List<Equipamiento> getEquipamiento() {
        return equipamientoRepository.findAll();
    }

    @GetMapping("/etiquetas-ambientales")
    public List<EtiquetaAmbiental> getEtiquetasAmbientales() {
        return etiquetaAmbientalRepository.findAll();
    }
}
