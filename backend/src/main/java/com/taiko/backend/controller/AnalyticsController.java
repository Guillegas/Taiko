package com.taiko.backend.controller;

import com.taiko.backend.model.AnalyticsSummaryDTO;
import com.taiko.backend.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Expone los datos del dashboard de analíticas para el panel de administración. */
@RestController
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasAuthority('admin')")
public class AnalyticsController {

    @Autowired private AnalyticsService analyticsService;

    /** Devuelve KPIs, series temporales, top vehículos y distribución de canales en una sola respuesta. */
    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryDTO> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }
}
