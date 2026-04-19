import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, ShieldAlert, BadgeInfo, Send, MessageCircle, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const FALLBACK_IMAGE = 'https://placehold.co/1200x800/1a1a2e/e0e0e0?text=Sin+Imagen';

export default function CarDetail() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${API_URL}/cars/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Coche no encontrado');
        return res.json();
      })
      .then(data => {
        setCar(data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="text-xl text-muted spinner">⚙️</div>
        <span className="ml-4 text-main">Cargando detalles del vehículo...</span>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="page-container text-center py-20">
        <ShieldAlert size={64} className="text-danger mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-main mb-4">Vehículo no encontrado</h1>
        <p className="text-muted mb-8">El coche que buscas no existe o ha sido retirado.</p>
        <Link to="/inventario" className="btn-primary" style={{ padding: '12px 24px' }}>Volver al catálogo</Link>
      </div>
    );
  }

  const images = car.imagenes && car.imagenes.length > 0 
    ? car.imagenes.map(img => img.url) 
    : [FALLBACK_IMAGE];

  return (
    <div className="page-container py-10" style={{ maxWidth: '1200px' }}>
      
      {/* Header and Back Button */}
      <div className="mb-8">
        <Link to="/inventario" className="text-muted flex items-center mb-6 hover-primary no-underline font-medium text-sm w-fit">
          <ArrowLeft size={16} className="mr-2" /> Volver al catálogo
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-bold text-main m-0">{car.marca} {car.modelo}</h1>
              <span style={{
                backgroundColor: car.disponible ? '#10B981' : '#F59E0B',
                color: 'white',
                borderRadius: '999px',
                fontSize: '0.9rem',
                fontWeight: 700,
                padding: '6px 18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                whiteSpace: 'nowrap',
                letterSpacing: '0.02em'
              }}>
                {car.disponible ? 'Disponible' : 'Reservado'}
              </span>
            </div>
            <p className="text-xl text-muted m-0">{car.version} • {car.anio}</p>
          </div>
          <div className="text-primary font-bold text-4xl m-0">
            €{new Intl.NumberFormat('es-ES').format(car.precio)}
          </div>
        </div>
      </div>

      {/* Two-column layout: left (gallery + description), right (specs + equipment) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px', alignItems: 'start' }}>

        {/* Left column: Gallery + Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Gallery */}
          <Gallery images={images} carName={`${car.marca} ${car.modelo}`} />

          {/* Description */}
          <div>
            <h3 className="text-2xl font-bold text-main mb-6">Descripción del Vehículo</h3>
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <p className="text-main leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                {car.descripcion || 'No hay descripción disponible para este vehículo.'}
              </p>
            </div>
          </div>

        </div>

        {/* Right column: Specs + Equipment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Specs Card */}
          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-main mb-6 flex items-center gap-2">
              <BadgeInfo size={24} className="text-primary" /> Detalles Técnicos
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted">Kilómetros</span>
                <span className="font-bold text-main">{car.kilometros?.toLocaleString('es-ES')} km</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted">Carrocería</span>
                <span className="font-bold text-main">{car.carroceria?.nombre || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted">Combustible</span>
                <span className="font-bold text-main">
                  {car.combustibles && car.combustibles.length > 0 ? car.combustibles.map(c => c.nombre).join(', ') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted">Transmisión</span>
                <span className="font-bold text-main">{car.transmision?.nombre || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted">Color Exterior</span>
                <span className="font-bold text-main">{car.color}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted">Distintivo Ambiental</span>
                <span className="font-bold text-main">{car.etiquetaAmbiental?.nombre || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-muted">Bastidor (VIN)</span>
                <span className="font-mono text-xs bg-hover px-2 py-1 rounded text-main">{car.vin || 'NO DISPONIBLE'}</span>
              </div>
            </div>

          </div>

          {/* Equipment list */}
          <div>
            <h3 className="text-2xl font-bold text-main mb-6">Equipamiento Destacado</h3>
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              {car.equipamiento && car.equipamiento.length > 0 ? (
                <ul className="flex flex-col gap-4 list-none p-0 m-0">
                  {car.equipamiento.map(eq => (
                    <li key={eq.id} className="flex items-center gap-3 text-main">
                      <div className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span>{eq.nombre}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">Sin información de equipamiento.</p>
              )}
            </div>
          </div>

          {/* Contact form */}
          <ContactForm car={car} />

        </div>

      </div>

    </div>
  );
}

function Gallery({ images, carName }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = useCallback(() => setActive(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActive(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') setLightbox(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, prev, next]);

  return (
    <>
      {/* Main image */}
      <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: 'var(--bg-hover)', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
        <div style={{ height: '440px', cursor: 'zoom-in' }} onClick={() => setLightbox(true)}>
          <img
            src={images[active]}
            alt={carName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.2s' }}
            onError={e => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
          />
        </div>

        {/* Zoom hint */}
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.45)', borderRadius: '8px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 5, color: 'white', fontSize: '0.75rem', pointerEvents: 'none' }}>
          <ZoomIn size={14} /> Ver ampliada
        </div>

        {/* Counter */}
        <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '999px', padding: '4px 14px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>
          {active + 1} / {images.length}
        </div>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button onClick={prev} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.75)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.45)'}>
              <ChevronLeft size={22} />
            </button>
            <button onClick={next} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.75)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.45)'}>
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {images.map((url, idx) => (
            <div key={idx} onClick={() => setActive(idx)}
              style={{ flexShrink: 0, width: 88, height: 66, borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                border: active === idx ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                opacity: active === idx ? 1 : 0.6, transition: 'all 0.15s', boxShadow: active === idx ? '0 2px 8px rgba(37,99,235,0.25)' : 'none' }}>
              <img src={url} alt={`Foto ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }} />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)} style={{ position: 'absolute', top: 20, right: 24, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <X size={22} />
          </button>
          <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
            {active + 1} / {images.length} · ESC para cerrar · ← → para navegar
          </div>
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev(); }} style={{ position: 'absolute', left: 24, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                <ChevronLeft size={28} />
              </button>
              <button onClick={e => { e.stopPropagation(); next(); }} style={{ position: 'absolute', right: 24, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                <ChevronRight size={28} />
              </button>
            </>
          )}
          <img src={images[active]} alt={carName} onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 8px 48px rgba(0,0,0,0.6)' }}
            onError={e => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }} />
        </div>
      )}
    </>
  );
}

function ContactForm({ car }) {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // En un entorno real aquí iría la llamada al backend
    setSent(true);
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-main mb-6 flex items-center gap-2">
        <MessageCircle size={24} className="text-primary" /> Contactar sobre este vehículo
      </h3>
      <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
        {sent ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Send size={24} />
            </div>
            <p className="font-bold text-main" style={{ fontSize: '1.1rem', marginBottom: '8px' }}>¡Mensaje enviado!</p>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Nos pondremos en contacto contigo lo antes posible.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
              Estás interesado en: <strong className="text-main">{car.marca} {car.modelo} {car.version}</strong>
            </p>
            <div>
              <label className="label" style={{ fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Nombre</label>
              <input type="text" className="input-field" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required style={{ width: '100%' }} />
            </div>
            <div>
              <label className="label" style={{ fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Email</label>
              <input type="email" className="input-field" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required style={{ width: '100%' }} />
            </div>
            <div>
              <label className="label" style={{ fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Teléfono</label>
              <input type="text" className="input-field" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} style={{ width: '100%' }} />
            </div>
            <div>
              <label className="label" style={{ fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Mensaje</label>
              <textarea className="input-field" rows="4" value={form.mensaje} onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))} required style={{ width: '100%', resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn-primary w-full" style={{ padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Enviar consulta <Send size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
