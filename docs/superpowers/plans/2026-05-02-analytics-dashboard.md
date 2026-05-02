# Analytics Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir una pestaña "Analíticas" al AdminPanel que muestre KPIs, gráficos temporales, top vehículos recomendados y distribución de canales.

**Architecture:** Un único endpoint `GET /api/admin/analytics/summary` (protegido por rol admin) devuelve toda la información en una respuesta JSON. El frontend consume ese endpoint al montar la pestaña y renderiza los gráficos con Recharts.

**Tech Stack:** Spring Boot 3 / JPA (native queries), PostgreSQL, React 18 + Vite, Recharts

---

## Ficheros implicados

### Backend — Crear
- `backend/src/main/java/com/taiko/backend/model/DatosPorDiaDTO.java`
- `backend/src/main/java/com/taiko/backend/model/DistribucionCanalDTO.java`
- `backend/src/main/java/com/taiko/backend/model/VehiculoTopDTO.java`
- `backend/src/main/java/com/taiko/backend/model/AnalyticsSummaryDTO.java`
- `backend/src/main/java/com/taiko/backend/service/AnalyticsService.java`
- `backend/src/main/java/com/taiko/backend/controller/AnalyticsController.java`

### Backend — Modificar
- `backend/src/main/java/com/taiko/backend/repository/ConversacionRepository.java` — añadir 2 queries
- `backend/src/main/java/com/taiko/backend/repository/UserRepository.java` — añadir 1 query
- `backend/src/main/java/com/taiko/backend/repository/MensajeRepository.java` — añadir 1 query

### Frontend — Crear
- `frontend/src/pages/AnalyticsDashboard.jsx`

### Frontend — Modificar
- `frontend/src/pages/AdminPanel.jsx` — añadir tercera pestaña y renderizar AnalyticsDashboard

### Documentación — Modificar
- `TFG_Taiko_Guillermo_Andujar.md`
- `README.md`

---

## Task 1: DTOs del backend

**Files:**
- Create: `backend/src/main/java/com/taiko/backend/model/DatosPorDiaDTO.java`
- Create: `backend/src/main/java/com/taiko/backend/model/DistribucionCanalDTO.java`
- Create: `backend/src/main/java/com/taiko/backend/model/VehiculoTopDTO.java`
- Create: `backend/src/main/java/com/taiko/backend/model/AnalyticsSummaryDTO.java`

- [ ] **Crear DatosPorDiaDTO.java**

```java
package com.taiko.backend.model;

public class DatosPorDiaDTO {
    private String fecha;
    private Long cantidad;

    public DatosPorDiaDTO(String fecha, Long cantidad) {
        this.fecha = fecha;
        this.cantidad = cantidad;
    }

    public String getFecha() { return fecha; }
    public Long getCantidad() { return cantidad; }
}
```

- [ ] **Crear DistribucionCanalDTO.java**

```java
package com.taiko.backend.model;

public class DistribucionCanalDTO {
    private String canal;
    private Long cantidad;

    public DistribucionCanalDTO(String canal, Long cantidad) {
        this.canal = canal;
        this.cantidad = cantidad;
    }

    public String getCanal() { return canal; }
    public Long getCantidad() { return cantidad; }
}
```

- [ ] **Crear VehiculoTopDTO.java**

```java
package com.taiko.backend.model;

public class VehiculoTopDTO {
    private String marca;
    private String modelo;
    private Long veces;

    public VehiculoTopDTO(String marca, String modelo, Long veces) {
        this.marca = marca;
        this.modelo = modelo;
        this.veces = veces;
    }

    public String getMarca() { return marca; }
    public String getModelo() { return modelo; }
    public Long getVeces() { return veces; }
}
```

- [ ] **Crear AnalyticsSummaryDTO.java**

```java
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
```

- [ ] **Compilar para verificar que no hay errores de sintaxis**

```bash
cd /Users/guillegas/Desktop/taiko_tfg/backend && ./mvnw compile -q
```

Resultado esperado: BUILD SUCCESS sin errores.

- [ ] **Commit**

```bash
git add backend/src/main/java/com/taiko/backend/model/DatosPorDiaDTO.java \
        backend/src/main/java/com/taiko/backend/model/DistribucionCanalDTO.java \
        backend/src/main/java/com/taiko/backend/model/VehiculoTopDTO.java \
        backend/src/main/java/com/taiko/backend/model/AnalyticsSummaryDTO.java
git commit -m "feat: DTOs para el dashboard de analíticas"
```

---

## Task 2: Queries en los repositorios

**Files:**
- Modify: `backend/src/main/java/com/taiko/backend/repository/ConversacionRepository.java`
- Modify: `backend/src/main/java/com/taiko/backend/repository/UserRepository.java`
- Modify: `backend/src/main/java/com/taiko/backend/repository/MensajeRepository.java`

- [ ] **Añadir queries a ConversacionRepository.java**

Reemplazar el contenido completo con:

```java
package com.taiko.backend.repository;

import com.taiko.backend.model.Conversacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversacionRepository extends JpaRepository<Conversacion, UUID> {
    List<Conversacion> findByUsuarioId(UUID usuarioId);
    List<Conversacion> findByUsuarioIdOrderByFechaInicioDesc(UUID usuarioId);
    Optional<Conversacion> findByIdAndUsuarioId(UUID id, UUID usuarioId);

    // Cuenta conversaciones agrupadas por día (últimos N días)
    @Query(value = "SELECT CAST(fecha_inicio AS DATE) AS fecha, COUNT(*) AS cantidad " +
                   "FROM conversaciones WHERE fecha_inicio >= :desde " +
                   "GROUP BY CAST(fecha_inicio AS DATE) ORDER BY fecha ASC",
           nativeQuery = true)
    List<Object[]> countConversacionesPorDia(@Param("desde") LocalDateTime desde);

    // Distribución de conversaciones por canal
    @Query("SELECT c.canal, COUNT(c) FROM Conversacion c GROUP BY c.canal")
    List<Object[]> countPorCanal();
}
```

- [ ] **Añadir query a UserRepository.java**

Añadir al final de la interfaz (antes del cierre `}`):

```java
    // Cuenta usuarios registrados agrupados por día (últimos N días)
    @org.springframework.data.jpa.repository.Query(
        value = "SELECT CAST(created_at AS DATE) AS fecha, COUNT(*) AS cantidad " +
                "FROM usuarios WHERE created_at >= :desde " +
                "GROUP BY CAST(created_at AS DATE) ORDER BY fecha ASC",
        nativeQuery = true)
    List<Object[]> countUsuariosPorDia(@org.springframework.data.repository.query.Param("desde") java.time.LocalDateTime desde);
```

- [ ] **Añadir query a MensajeRepository.java**

Añadir al final de la interfaz (antes del cierre `}`):

```java
    // Extrae los UUIDs de vehículos mencionados en mensajes del chatbot y devuelve el top 5
    @org.springframework.data.jpa.repository.Query(
        value = """
            SELECT v.marca, v.modelo, COUNT(*) AS veces
            FROM (
                SELECT unnest(regexp_matches(m.contenido,
                    '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', 'g'
                )) AS uuid_str
                FROM mensajes m
                WHERE m.emisor::text = 'chatbot'
            ) AS uuids
            JOIN vehiculos v ON v.id = uuid_str::uuid
            GROUP BY v.id, v.marca, v.modelo
            ORDER BY veces DESC
            LIMIT 5
            """,
        nativeQuery = true)
    List<Object[]> topVehiculosRecomendados();
```

- [ ] **Compilar para verificar**

```bash
cd /Users/guillegas/Desktop/taiko_tfg/backend && ./mvnw compile -q
```

Resultado esperado: BUILD SUCCESS.

- [ ] **Commit**

```bash
git add backend/src/main/java/com/taiko/backend/repository/ConversacionRepository.java \
        backend/src/main/java/com/taiko/backend/repository/UserRepository.java \
        backend/src/main/java/com/taiko/backend/repository/MensajeRepository.java
git commit -m "feat: queries de analíticas en repositorios JPA"
```

---

## Task 3: AnalyticsService + AnalyticsController

**Files:**
- Create: `backend/src/main/java/com/taiko/backend/service/AnalyticsService.java`
- Create: `backend/src/main/java/com/taiko/backend/controller/AnalyticsController.java`

- [ ] **Crear AnalyticsService.java**

```java
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

    public AnalyticsSummaryDTO getSummary() {
        long totalVehiculos = vehiculoRepository.count();
        long totalUsuarios = userRepository.count();
        long totalConversaciones = conversacionRepository.count();
        long totalMensajes = mensajeRepository.count();

        LocalDateTime desde = LocalDateTime.now().minusDays(29).toLocalDate().atStartOfDay();

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

    // Rellena los 30 días completos con 0 en los días sin actividad
    private List<DatosPorDiaDTO> buildSerie(List<Object[]> rows) {
        Map<LocalDate, Long> rawMap = new LinkedHashMap<>();
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
```

- [ ] **Crear AnalyticsController.java**

```java
package com.taiko.backend.controller;

import com.taiko.backend.model.AnalyticsSummaryDTO;
import com.taiko.backend.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasAuthority('admin')")
public class AnalyticsController {

    @Autowired private AnalyticsService analyticsService;

    /** Devuelve todos los datos del dashboard de analíticas en una sola respuesta. */
    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryDTO> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }
}
```

- [ ] **Compilar**

```bash
cd /Users/guillegas/Desktop/taiko_tfg/backend && ./mvnw compile -q
```

Resultado esperado: BUILD SUCCESS.

- [ ] **Arrancar el backend y verificar el endpoint**

```bash
cd /Users/guillegas/Desktop/taiko_tfg/backend && ./mvnw spring-boot:run
```

En otro terminal, con un token JWT de admin:

```bash
TOKEN="<pegar token JWT de admin aquí>"
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/admin/analytics/summary | python3 -m json.tool
```

Resultado esperado: JSON con `totalVehiculos`, `totalUsuarios`, `totalConversaciones`, `totalMensajes`, `conversacionesPorDia` (array de 30 elementos), `usuariosPorDia` (array de 30 elementos), `distribucionCanales`, `vehiculosTop`.

Verificar también que sin token devuelve 403:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/admin/analytics/summary
```
Resultado esperado: `403`

- [ ] **Commit**

```bash
git add backend/src/main/java/com/taiko/backend/service/AnalyticsService.java \
        backend/src/main/java/com/taiko/backend/controller/AnalyticsController.java
git commit -m "feat: AnalyticsService y AnalyticsController con endpoint /api/admin/analytics/summary"
```

---

## Task 4: Frontend — instalar Recharts y crear AnalyticsDashboard

**Files:**
- Modify: `frontend/package.json` (via npm install)
- Create: `frontend/src/pages/AnalyticsDashboard.jsx`

- [ ] **Instalar recharts**

```bash
cd /Users/guillegas/Desktop/taiko_tfg/frontend && npm install recharts
```

Resultado esperado: recharts aparece en `dependencies` del `package.json`.

- [ ] **Crear AnalyticsDashboard.jsx**

```jsx
import { useState, useEffect } from 'react';
import { Car, Users, MessageSquare, MessagesSquare, Loader } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL;
const PIE_COLORS = ['#2563EB', '#10B981'];

export default function AnalyticsDashboard({ authHeader }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/admin/analytics/summary`, { headers: authHeader() })
      .then(r => {
        if (!r.ok) throw new Error('Error al cargar las analíticas');
        return r.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
      <Loader size={28} className="text-muted" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (error) return (
    <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--danger)' }}>
      {error}
    </div>
  );

  if (!data) return null;

  const kpis = [
    { label: 'Vehículos', value: data.totalVehiculos, Icon: Car, color: 'var(--primary)', bg: 'var(--primary-light)' },
    { label: 'Usuarios', value: data.totalUsuarios, Icon: Users, color: 'var(--success)', bg: 'var(--success-bg)' },
    { label: 'Conversaciones', value: data.totalConversaciones, Icon: MessageSquare, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    { label: 'Mensajes', value: data.totalMensajes, Icon: MessagesSquare, color: 'var(--warning)', bg: 'var(--warning-bg)' },
  ];

  const tickStyle = { fontSize: 11, fill: 'var(--text-muted)' };
  const gridStyle = { strokeDasharray: '3 3', stroke: 'var(--border-color)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {kpis.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: bg, flexShrink: 0 }}>
              <Icon size={22} style={{ color }} />
            </div>
            <div>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos de línea — series temporales */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <p className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Conversaciones — últimos 30 días
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.conversacionesPorDia}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="fecha" tick={tickStyle} tickFormatter={v => v.slice(5)} interval={6} />
              <YAxis tick={tickStyle} allowDecimals={false} width={30} />
              <Tooltip labelFormatter={v => `Fecha: ${v}`} formatter={v => [v, 'Conversaciones']} />
              <Line type="monotone" dataKey="cantidad" stroke="var(--primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <p className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Usuarios nuevos — últimos 30 días
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.usuariosPorDia}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="fecha" tick={tickStyle} tickFormatter={v => v.slice(5)} interval={6} />
              <YAxis tick={tickStyle} allowDecimals={false} width={30} />
              <Tooltip labelFormatter={v => `Fecha: ${v}`} formatter={v => [v, 'Usuarios']} />
              <Line type="monotone" dataKey="cantidad" stroke="var(--success)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top vehículos recomendados */}
      <div className="card" style={{ padding: '20px' }}>
        <p className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Top 5 vehículos más recomendados por el chatbot
        </p>
        {data.vehiculosTop.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '40px 0' }}>
            Sin datos todavía. El chatbot aún no ha recomendado vehículos.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={data.vehiculosTop.length * 52 + 20}>
            <BarChart
              data={data.vehiculosTop.map(v => ({ nombre: `${v.marca} ${v.modelo}`, veces: v.veces }))}
              layout="vertical"
              margin={{ left: 8, right: 20 }}
            >
              <CartesianGrid {...gridStyle} />
              <XAxis type="number" tick={tickStyle} allowDecimals={false} />
              <YAxis type="category" dataKey="nombre" width={160} tick={tickStyle} />
              <Tooltip formatter={v => [v, 'Recomendaciones']} />
              <Bar dataKey="veces" fill="var(--primary)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Distribución por canal */}
      <div className="card" style={{ padding: '20px' }}>
        <p className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Conversaciones por canal
        </p>
        {data.distribucionCanales.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '40px 0' }}>
            Sin conversaciones todavía.
          </p>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="60%" height={240}>
              <PieChart>
                <Pie
                  data={data.distribucionCanales.map(d => ({ name: d.canal, value: Number(d.cantidad) }))}
                  cx="50%" cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.distribucionCanales.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={v => [v, 'Conversaciones']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Commit**

```bash
cd /Users/guillegas/Desktop/taiko_tfg
git add frontend/package.json frontend/package-lock.json frontend/src/pages/AnalyticsDashboard.jsx
git commit -m "feat: componente AnalyticsDashboard con Recharts"
```

---

## Task 5: Integrar la pestaña en AdminPanel

**Files:**
- Modify: `frontend/src/pages/AdminPanel.jsx`

- [ ] **Añadir import de AnalyticsDashboard y BarChart2 icon**

En la línea 1 del fichero, añadir el import de AnalyticsDashboard:
```jsx
import AnalyticsDashboard from './AnalyticsDashboard';
```

En el import de lucide-react existente, añadir `BarChart2`:
```jsx
import { ArrowLeft, Plus, Edit2, Trash2, Search, X, ImagePlus, Upload, FileText, CheckCircle2, AlertCircle, Users, Car, BarChart2 } from 'lucide-react';
```

- [ ] **Añadir la tercera pestaña en el bloque de tabs**

Localizar el bloque de tabs (las dos `<button>` de "Vehículos" y "Usuarios") y añadir un tercero al final:

```jsx
<button
  style={{ flex: 1, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', background: activeTab === 'analiticas' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'analiticas' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'analiticas' ? '2px solid var(--primary)' : '2px solid transparent', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s' }}
  onClick={() => setActiveTab('analiticas')}
>
  <BarChart2 size={17} /> Analíticas
</button>
```

- [ ] **Renderizar AnalyticsDashboard cuando la pestaña esté activa**

Justo antes del bloque `{activeTab === 'vehiculos' && (<>`, añadir:

```jsx
{activeTab === 'analiticas' && (
  <AnalyticsDashboard authHeader={authHeader} />
)}
```

- [ ] **Verificar en el navegador**

Arrancar el frontend:
```bash
cd /Users/guillegas/Desktop/taiko_tfg/frontend && npm run dev
```

Ir a `http://localhost:5173`, iniciar sesión como admin, entrar en `/admin`, y comprobar:
- La pestaña "Analíticas" aparece en el panel
- Los 4 KPIs muestran números reales
- Los gráficos de línea tienen 30 puntos en el eje X
- El gráfico de barras muestra vehículos (o el mensaje "Sin datos todavía")
- El gráfico de tarta muestra la distribución de canales
- No hay errores en la consola del navegador

- [ ] **Commit**

```bash
git add frontend/src/pages/AdminPanel.jsx
git commit -m "feat: pestaña Analíticas en AdminPanel"
```

---

## Task 6: Actualizar documentación

**Files:**
- Modify: `TFG_Taiko_Guillermo_Andujar.md`
- Modify: `README.md`

- [ ] **Actualizar TFG_Taiko_Guillermo_Andujar.md**

  - Sección 4.1: añadir RF-015 a la tabla de requisitos funcionales de OB-002 (o como OB-005 nuevo)
  - Sección 5.2: añadir CU-013 "Ver dashboard de analíticas"
  - Sección 6.4: añadir el endpoint `GET /api/admin/analytics/summary` a la tabla de la API REST
  - Sección 7.1: mencionar AnalyticsService y AnalyticsController
  - Sección 7.3: mencionar AnalyticsDashboard.jsx y Recharts

- [ ] **Actualizar README.md**

  Añadir "Dashboard de analíticas" en la lista de features.

- [ ] **Commit**

```bash
git add TFG_Taiko_Guillermo_Andujar.md README.md
git commit -m "docs: documentar dashboard de analíticas en TFG y README"
```
