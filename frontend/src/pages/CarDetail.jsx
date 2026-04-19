import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, ShieldAlert, BadgeInfo, Send, MessageCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const FALLBACK_IMAGE = 'https://placehold.co/1200x800/1a1a2e/e0e0e0?text=Sin+Imagen';

export default function CarDetail() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

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
          <div>
            <div className="w-full bg-hover rounded-xl overflow-hidden shadow-md mb-4" style={{ height: '400px' }}>
              <img
                src={images[activeImage]}
                alt={`${car.marca} ${car.modelo}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
              />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((url, idx) => (
                <div
                  key={idx}
                  className={`w-24 h-24 rounded-lg overflow-hidden shrink-0 cursor-pointer border-2 transition-colors ${activeImage === idx ? 'border-primary' : 'border-transparent'}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }} />
                </div>
              ))}
            </div>
          </div>

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
