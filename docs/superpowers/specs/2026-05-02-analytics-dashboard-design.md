# Analytics Dashboard — Spec

**Fecha:** 2026-05-02  
**Proyecto:** Taiko TFG  
**Estado:** Aprobado

---

## Contexto

El AdminPanel actualmente tiene dos pestañas: "Vehículos" y "Usuarios". Se añade una tercera pestaña "Analíticas" que muestra métricas de uso de la plataforma en tiempo real para el administrador.

---

## Requisito funcional nuevo

**RF-015 · Dashboard de analíticas**  
El administrador puede ver en una pestaña dedicada métricas clave de la plataforma: KPIs de conteo, evolución temporal de conversaciones y registros, vehículos más recomendados por el chatbot, y distribución de canales.

---

## Arquitectura

### Backend

**Endpoint único:**
```
GET /api/admin/analytics/summary
Autenticación: hasAuthority('admin')
```

**Respuesta JSON:**
```json
{
  "totalVehiculos": 100,
  "totalUsuarios": 42,
  "totalConversaciones": 300,
  "totalMensajes": 1800,
  "conversacionesPorDia": [
    { "fecha": "2026-04-02", "cantidad": 5 },
    ...
  ],
  "usuariosPorDia": [
    { "fecha": "2026-04-02", "cantidad": 2 },
    ...
  ],
  "distribucionCanales": [
    { "canal": "web", "cantidad": 250 },
    { "canal": "telegram", "cantidad": 50 }
  ],
  "vehiculosTop": [
    { "marca": "BMW", "modelo": "Serie 3", "veces": 12 },
    ...
  ]
}
```

**Ficheros nuevos:**
- `controller/AnalyticsController.java` — endpoint REST, protegido con `@PreAuthorize("hasAuthority('admin')")`
- `service/AnalyticsService.java` — lógica de agregación con las queries
- `model/AnalyticsSummaryDTO.java` — contenedor principal de la respuesta
- `model/DatosPorDiaDTO.java` — par fecha (String `yyyy-MM-dd`) + cantidad (Long)
- `model/VehiculoTopDTO.java` — marca (String) + modelo (String) + veces (Long)

**Queries:**
- KPIs: `count(*)` sobre `vehiculos`, `usuarios`, `conversaciones`, `mensajes` respectivamente
- Series temporales: `GROUP BY CAST(fecha_inicio AS DATE)` con `WHERE fecha_inicio >= NOW() - INTERVAL '30 days'` (conversaciones) y equivalente para `usuarios.created_at`
- Distribución canales: `GROUP BY canal` sobre `conversaciones`
- Top vehículos: query nativa PostgreSQL con `regexp_matches(contenido, '[0-9a-f]{8}-...-[0-9a-f]{12}', 'g')` sobre mensajes del chatbot (`emisor = 'chatbot'`), JOIN con `vehiculos`, `GROUP BY v.id`, `ORDER BY COUNT DESC LIMIT 5`

**Seguridad:** Endpoint bajo `/api/admin/**`, ya cubierto por `SecurityConfig` existente.

---

### Frontend

**Dependencia nueva:** `recharts` (instalar con `npm install recharts`)

**Fichero modificado:** `src/pages/AdminPanel.jsx`  
- Añadir tercer botón en el bloque de tabs: `activeTab === 'analiticas'`
- Añadir sección `{activeTab === 'analiticas' && <AnalyticsDashboard />}`

**Fichero nuevo:** `src/pages/AnalyticsDashboard.jsx`  
Componente standalone que recibe `user` (para el header de auth) como prop. Al montarse hace fetch a `/api/admin/analytics/summary`. Mientras carga muestra spinner. Si hay error muestra mensaje.

**Layout (de arriba a abajo):**

1. **Fila de 4 tarjetas KPI**  
   Grid 4 columnas (2 en móvil). Cada tarjeta: icono (lucide-react), número grande, etiqueta. Colores: vehículos=azul, usuarios=verde, conversaciones=morado, mensajes=naranja.

2. **Dos gráficos de línea en paralelo** (grid 2 columnas, 1 en móvil)  
   - "Conversaciones últimos 30 días" — `LineChart` con `conversacionesPorDia`  
   - "Usuarios nuevos últimos 30 días" — `LineChart` con `usuariosPorDia`  
   Eje X: fecha (formato `dd/MM`), eje Y: cantidad. Tooltip con valor exacto.

3. **Gráfico de barras horizontal (ancho completo)**  
   "Top 5 vehículos más recomendados" — `BarChart` con `vehiculosTop`.  
   Eje X: `${marca} ${modelo}`, eje Y: número de recomendaciones. Si no hay datos: mensaje "Sin datos todavía".

4. **Gráfico de tarta** centrado  
   "Conversaciones por canal" — `PieChart` con `distribucionCanales`.  
   Dos sectores: web (azul) / telegram (verde). Leyenda debajo. Si solo hay un canal, se muestra igualmente.

---

## Documentación

Al finalizar la implementación, actualizar:
- `TFG_Taiko_Guillermo_Andujar.md`: añadir RF-015 en la tabla de requisitos funcionales (sección 4.1), añadir CU-013 en casos de uso (sección 5.2), añadir endpoint en la tabla de la API REST (sección 6.4), y mencionar el dashboard en la sección 7.1 (implementación backend) y 7.3 (frontend)
- `README.md`: añadir el dashboard en la lista de features

---

## Criterios de aceptación

- [ ] La pestaña "Analíticas" aparece en el AdminPanel solo para usuarios con rol `admin`
- [ ] Los 4 KPIs muestran los valores reales de la base de datos
- [ ] El gráfico de conversaciones por día cubre exactamente los últimos 30 días (días sin actividad aparecen con valor 0)
- [ ] El gráfico de usuarios por día ídem
- [ ] El top de vehículos extrae correctamente los UUIDs de los mensajes del chatbot
- [ ] La distribución de canales distingue `web` y `telegram`
- [ ] Si no hay datos en algún gráfico, se muestra un mensaje claro en lugar de un gráfico vacío
- [ ] El endpoint devuelve 403 si se llama sin token de admin
- [ ] Los gráficos son responsive y se adaptan a móvil
- [ ] Funciona correctamente en modo claro y oscuro
