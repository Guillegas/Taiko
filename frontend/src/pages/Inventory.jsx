import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowLeft, Loader2 } from 'lucide-react';
import { SharedCarCard } from './Home';

const API_URL = import.meta.env.VITE_API_URL;

export default function Inventory() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [semanticResults, setSemanticResults] = useState(null); // null = sin búsqueda activa
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  // Filters state
  const [filters, setFilters] = useState({
    disponibilidad: 'Todos',
    tipo: 'Todos',
    combustible: 'Todos',
    transmision: 'Todos',
    color: 'Todos'
  });

  useEffect(() => {
    fetch(`${API_URL}/cars`)
      .then(res => res.json())
      .then(data => {
        setCars(data.reverse());
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  // Búsqueda semántica con debounce
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!searchTerm.trim()) {
      setSemanticResults(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`${API_URL}/cars/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchTerm }),
        });
        if (res.ok) {
          const data = await res.json();
          setSemanticResults(data.map(r => r.vehiculo));
        } else {
          setSemanticResults([]);
        }
      } catch {
        setSemanticResults(null);
      } finally {
        setSearching(false);
      }
    }, 500);
  }, [searchTerm]);

  const baseList = semanticResults !== null ? semanticResults : cars;

  // Filtros locales sobre el resultado base
  const filteredCars = baseList.filter(car => {
    let match = true;
    if (filters.tipo !== 'Todos' && car.carroceria?.nombre !== filters.tipo) match = false;
    if (filters.transmision !== 'Todos' && car.transmision?.nombre !== filters.transmision) match = false;

    // Match backend boolean for Disponibilidad
    if (filters.disponibilidad !== 'Todos') {
      const isAvailable = filters.disponibilidad === 'Disponible';
      if (car.disponible !== isAvailable) match = false;
    }

    // Match array elements for Combustible
    if (filters.combustible !== 'Todos') {
      const hasFuel = car.combustibles && car.combustibles.some(c => c.nombre === filters.combustible);
      if (!hasFuel) match = false;
    }

    // Direct match for Color
    if (filters.color !== 'Todos' && car.color !== filters.color) match = false;

    return match;
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      disponibilidad: 'Todos',
      tipo: 'Todos',
      combustible: 'Todos',
      transmision: 'Todos',
      color: 'Todos'
    });
    setSearchTerm('');
    setSemanticResults(null);
  };

  return (
    <div className="page-container" style={{maxWidth: '1200px'}}>
      
      {/* Header */}
      <div className="mb-8">
        <Link to="/" className="text-muted flex items-center mb-4 hover-primary no-underline font-medium text-sm">
          <ArrowLeft size={16} className="mr-2" /> Volver al inicio
        </Link>
        <h1 className="text-4xl font-bold mb-2 text-main">Catálogo Completo</h1>
        <p className="text-muted">Encuentra el vehículo perfecto para ti - {cars.length} vehículos en total</p>
      </div>

      {/* Global Search Bar */}
      <div className="search-bar" style={{ marginBottom: '32px', maxWidth: '100%' }}>
        {searching ? <Loader2 size={18} className="text-primary spinner" style={{ flexShrink: 0 }} /> : <Search size={18} className="text-muted" style={{ flexShrink: 0 }} />}
        <input
          type="text"
          placeholder="Describe el coche que buscas... (ej: SUV eléctrico familiar por menos de 40.000€)"
          className="search-input"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      {semanticResults !== null && !searching && (
        <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
          Búsqueda inteligente activa · {semanticResults.length} resultado{semanticResults.length !== 1 ? 's' : ''} encontrado{semanticResults.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Two Column Layout */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
        
        {/* Sidebar Filters */}
        <div style={{ flex: '0 0 280px', width: '100%' }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-main">Filtros</h2>
            <button
              onClick={clearFilters}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-hover)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}
            >
              Limpiar filtros
            </button>
          </div>

          <div className="flex flex-col gap-6">
            <div className="filter-group">
              <label className="label font-semibold text-main">Disponibilidad</label>
              <select 
                className="input-field"
                value={filters.disponibilidad}
                onChange={e => handleFilterChange('disponibilidad', e.target.value)}
              >
                <option>Todos</option>
                <option>Disponible</option>
                <option>Reservado</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="label font-semibold text-main">Tipo de vehículo</label>
              <select 
                className="input-field"
                value={filters.tipo}
                onChange={e => handleFilterChange('tipo', e.target.value)}
              >
                <option>Todos</option>
                <option>Sedán</option>
                <option>SUV</option>
                <option>Compacto</option>
                <option>Deportivo</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="label font-semibold text-main">Combustible</label>
              <select 
                className="input-field"
                value={filters.combustible}
                onChange={e => handleFilterChange('combustible', e.target.value)}
              >
                <option>Todos</option>
                <option>Gasolina</option>
                <option>Diésel</option>
                <option>Híbrido</option>
                <option>Eléctrico</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="label font-semibold text-main">Transmisión</label>
              <select 
                className="input-field"
                value={filters.transmision}
                onChange={e => handleFilterChange('transmision', e.target.value)}
              >
                <option>Todos</option>
                <option>Manual</option>
                <option>Automático</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="label font-semibold text-main">Color</label>
              <select 
                className="input-field"
                value={filters.color}
                onChange={e => handleFilterChange('color', e.target.value)}
              >
                <option>Todos</option>
                <option>Blanco</option>
                <option>Negro</option>
                <option>Gris</option>
                <option>Azul</option>
                <option>Rojo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Catalog Grid */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <p className="text-muted mb-6">{filteredCars.length} vehículo{filteredCars.length !== 1 ? 's' : ''} {semanticResults !== null ? 'coincidentes' : 'en total'}</p>
          
          {loading ? (
             <p className="text-muted">Cargando catálogo...</p>
          ) : (
            <div className="cars-grid">
              {filteredCars.map((car, i) => (
                <SharedCarCard key={car.id || i} car={car} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
