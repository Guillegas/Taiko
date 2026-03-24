import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  Shield,
  Settings,
  Award,
  Phone,
  Mail,
  MapPin,
  Send,
  Star,
  Calendar,
  Gauge,
  Fuel,
  Settings2,
  Palette,
  ChevronDown,
} from "lucide-react";

const API_URL = "http://localhost:8080/api";
const FALLBACK_IMAGE =
  "https://placehold.co/800x600/1a1a2e/e0e0e0?text=Sin+Imagen";

// Se extrae el CarCard genérico para poder usarlo en Home e Inventory
export function SharedCarCard({ car }) {
  const imageUrl =
    car.imagenes && car.imagenes.length > 0
      ? car.imagenes[0].url
      : FALLBACK_IMAGE;

  return (
    <div
      className="car-card card animate-fade-in-up bg-card relative"
      style={{ overflow: "hidden" }}
    >
      {/* Dynamic Badge */}
      <div
        style={{ position: "absolute", top: "12px", left: "12px", zIndex: 10 }}
      >
        <span
          style={{
            backgroundColor: car.disponible ? "#10B981" : "#F59E0B",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.75rem",
            fontWeight: 700,
            padding: "4px 10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          {car.disponible ? "Disponible" : "Reservado"}
        </span>
      </div>

      <div className="car-image-container" style={{ height: "200px" }}>
        <img
          src={imageUrl}
          alt={`${car.marca} ${car.modelo}`}
          className="car-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMAGE;
          }}
        />
      </div>
      <div className="car-details" style={{ padding: "16px 20px 20px" }}>
        <div className="flex justify-between items-start mb-1">
          <h3
            className="car-title text-main m-0"
            style={{ fontSize: "1.1rem" }}
          >
            {car.marca}
          </h3>
          <span
            className="text-primary font-bold"
            style={{ fontSize: "1.05rem", whiteSpace: "nowrap" }}
          >
            €{new Intl.NumberFormat("es-ES").format(car.precio)}
          </span>
        </div>
        <p
          className="text-muted m-0"
          style={{ fontSize: "0.85rem", marginBottom: "12px" }}
        >
          {car.modelo} {car.version}
        </p>

        {/* Stats Grid - 2 columns, clean rows */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            borderTop: "1px solid var(--border-color)",
            paddingTop: "12px",
            marginBottom: "16px",
          }}
        >
          <div className="flex items-center gap-2 text-sm text-muted">
            <Calendar
              size={14}
              className="text-primary"
              style={{ flexShrink: 0 }}
            />
            <span className="font-medium text-main">{car.anio || "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Gauge
              size={14}
              className="text-primary"
              style={{ flexShrink: 0 }}
            />
            <span className="font-medium text-main">
              {car.kilometros?.toLocaleString("es-ES") || "0"} km
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Fuel
              size={14}
              className="text-primary"
              style={{ flexShrink: 0 }}
            />
            <span className="font-medium text-main">
              {car.combustibles && car.combustibles.length > 0
                ? car.combustibles[0].nombre
                : "-"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Settings2
              size={14}
              className="text-primary"
              style={{ flexShrink: 0 }}
            />
            <span className="font-medium text-main">
              {car.transmision?.nombre || "-"}
            </span>
          </div>
          <div
            className="flex items-center gap-2 text-sm text-muted"
            style={{ gridColumn: "span 2" }}
          >
            <Palette
              size={14}
              className="text-primary"
              style={{ flexShrink: 0 }}
            />
            <span className="font-medium text-main">{car.color || "-"}</span>
          </div>
        </div>

        <Link
          to={`/inventario/${car.id}`}
          className="btn-primary w-full text-center mt-auto"
          style={{ borderRadius: "8px", padding: "10px", fontSize: "0.95rem" }}
        >
          Más información
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const [featuredCars, setFeaturedCars] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/cars`)
      .then((res) => res.json())
      .then((data) => {
        // Tomar los primeros 3 (después de reverse para que sean los últimos añadidos con imágenes)
        setFeaturedCars(data.reverse().slice(0, 3));
      })
      .catch(console.error);
  }, []);

  return (
    <div className="home-layout">
      {/* 1. HERO SECTION (Image 5) */}
      <section
        className="w-full text-center"
        style={{
          position: "relative",
          minHeight: "calc(100vh - 80px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          backgroundImage:
            'linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.75)), url("https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
        }}
      >
        <div
          className="animate-fade-in-up"
          style={{ maxWidth: "800px", padding: "0 24px" }}
        >
          <h1
            className="font-bold mb-4 tracking-tight"
            style={{
              color: "white",
              fontSize: "clamp(3rem, 6vw, 5rem)",
              lineHeight: 1.1,
            }}
          >
            Tu próximo coche te espera
          </h1>
          <p
            className="mb-10"
            style={{ color: "#cbd5e1", fontSize: "clamp(1.2rem, 3vw, 1.5rem)" }}
          >
            Descubre nuestra exclusiva colección de vehículos premium con las
            mejores condiciones de financiación
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/inventario"
              className="btn-primary flex items-center justify-center"
              style={{
                padding: "16px 32px",
                fontSize: "1.1rem",
                minWidth: "200px",
              }}
            >
              Ver Inventario &rarr;
            </Link>
            <a
              href="#contacto"
              className="btn-primary flex items-center justify-center"
              style={{
                padding: "16px 32px",
                fontSize: "1.1rem",
                minWidth: "200px",
                backgroundColor: "white",
                color: "#0F172A",
              }}
            >
              Contáctanos
            </a>
          </div>
        </div>

        {/* Scroll arrow */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div
            style={{
              animation: "bounceArrow 1.8s ease-in-out infinite",
              color: "white",
              opacity: 0.8,
            }}
          >
            <ChevronDown size={40} strokeWidth={1.5} />
          </div>
        </div>
      </section>

      {/* 2. VEHÍCULOS DISPONIBLES (Image 3) */}
      <section className="py-20 bg-main">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-main">
              Vehículos Premium
            </h2>
            <div style={{ padding: "10px" }}></div>
            <p className="text-lg text-muted">
              Selección de vehículos de alta gama.
            </p>
            <div style={{ padding: "10px" }}></div>
          </div>

          <div className="cars-grid">
            {featuredCars.map((car, idx) => (
              <SharedCarCard key={car.id || idx} car={car} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. SERVICIOS */}
      <section
        id="servicios"
        style={{ padding: "80px 0", scrollMarginTop: "80px" }}
      >
        <div
          className="page-container"
          style={{ maxWidth: "1000px", marginTop: "-150px" }}
        >
          <div className="text-center" style={{ marginBottom: "56px" }}>
            <p
              className="text-primary font-semibold text-sm uppercase tracking-wider m-0"
              style={{ marginBottom: "8px", letterSpacing: "0.1em" }}
            >
              ¿Por qué elegirnos?
            </p>
            <h2
              className="font-bold text-main m-0"
              style={{ fontSize: "2.25rem", marginBottom: "12px" }}
            >
              Nuestros Servicios
            </h2>
            <p
              className="text-muted m-0"
              style={{
                fontSize: "1.05rem",
                maxWidth: "550px",
                margin: "0 auto",
              }}
            >
              Más que vender coches, construimos relaciones duraderas con cada
              cliente
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "32px",
            }}
          >
            {[
              {
                icon: <CreditCard size={24} />,
                title: "Financiación Flexible",
                desc: "Opciones adaptadas a tus necesidades con las tasas más competitivas del mercado.",
              },
              {
                icon: <Shield size={24} />,
                title: "Garantía Extendida",
                desc: "Todos nuestros vehículos incluyen garantía completa para tu total tranquilidad.",
              },
              {
                icon: <Settings size={24} />,
                title: "Mantenimiento",
                desc: "Servicio profesional con técnicos certificados y piezas 100% originales.",
              },
              {
                icon: <Award size={24} />,
                title: "Mejor Precio",
                desc: "Garantizamos el mejor precio. Si encuentras uno mejor, lo igualamos.",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="card bg-card"
                style={{
                  padding: "32px 24px",
                  textAlign: "center",
                  border: "1px solid var(--border-color)",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "var(--primary-light)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  {s.icon}
                </div>
                <h3
                  className="font-bold text-main m-0"
                  style={{ fontSize: "1.05rem", marginBottom: "10px" }}
                >
                  {s.title}
                </h3>
                <p
                  className="text-muted m-0"
                  style={{ fontSize: "0.9rem", lineHeight: 1.6 }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TESTIMONIOS */}
      <section
        style={{
          padding: "80px 0",
          background: "var(--bg-hover)",
          scrollMarginTop: "80px",
        }}
      >
        <div className="page-container" style={{ maxWidth: "1000px" }}>
          <div className="text-center" style={{ marginBottom: "56px" }}>
            <p
              className="text-primary font-semibold text-sm uppercase tracking-wider m-0"
              style={{ marginBottom: "8px", letterSpacing: "0.1em" }}
            >
              Testimonios
            </p>
            <h2
              className="font-bold text-main m-0"
              style={{ fontSize: "2.25rem", marginBottom: "12px" }}
            >
              Lo Que Dicen Nuestros Clientes
            </h2>
            <p
              className="text-muted m-0"
              style={{
                fontSize: "1.05rem",
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              Miles de clientes satisfechos confían en nosotros
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                text: "Excelente servicio. El proceso de compra fue muy sencillo y el equipo muy profesional. ¡Totalmente recomendado!",
                name: "Carlos López",
                role: "Cliente desde 2022",
              },
              {
                text: "Increíble atención al cliente. Me ayudaron a encontrar el coche perfecto para mi familia con una financiación ideal.",
                name: "María García",
                role: "Cliente desde 2023",
              },
              {
                text: "La mejor experiencia comprando un coche. Transparencia total y sin sorpresas. Volveré sin duda.",
                name: "Andrés Martín",
                role: "Cliente desde 2024",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="card bg-card"
                style={{
                  padding: "32px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <div className="flex" style={{ gap: "2px" }}>
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={18} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <p
                  className="text-main m-0"
                  style={{ lineHeight: 1.7, fontSize: "0.95rem", flex: 1 }}
                >
                  "{t.text}"
                </p>
                <div
                  style={{
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: "16px",
                  }}
                >
                  <p
                    className="font-bold text-main m-0"
                    style={{ fontSize: "0.95rem" }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-muted m-0"
                    style={{ fontSize: "0.8rem", marginTop: "2px" }}
                  >
                    {t.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CONTACTO */}
      <section
        id="contacto"
        style={{ padding: "80px 0", scrollMarginTop: "80px" }}
      >
        <div className="page-container" style={{ maxWidth: "960px" }}>
          <div className="text-center" style={{ marginBottom: "56px" }}>
            <p
              className="text-primary font-semibold text-sm uppercase tracking-wider m-0"
              style={{ marginBottom: "8px", letterSpacing: "0.1em" }}
            >
              Ponte en contacto
            </p>
            <h2
              className="font-bold text-main m-0"
              style={{ fontSize: "2.25rem", marginBottom: "12px" }}
            >
              Contáctanos
            </h2>
            <p
              className="text-muted m-0"
              style={{
                fontSize: "1.05rem",
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              Estamos aquí para ayudarte a encontrar tu coche ideal
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
              gap: "40px",
              alignItems: "start",
            }}
          >
            {/* Left: Contact Info */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* Contact cards */}
              {[
                {
                  icon: <Phone size={20} />,
                  label: "Teléfono",
                  value: "+34 900 123 456",
                },
                {
                  icon: <Mail size={20} />,
                  label: "Email",
                  value: "info@autoelite.com",
                },
                {
                  icon: <MapPin size={20} />,
                  label: "Dirección",
                  value: "Calle Principal 123, 28001 Madrid",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center"
                  style={{ gap: "16px" }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "10px",
                      background: "var(--primary-light)",
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p
                      className="text-muted m-0"
                      style={{ fontSize: "0.8rem", marginBottom: "2px" }}
                    >
                      {item.label}
                    </p>
                    <p
                      className="font-semibold text-main m-0"
                      style={{ fontSize: "0.95rem" }}
                    >
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}

              {/* Schedule */}
              <div
                className="card bg-card"
                style={{
                  padding: "24px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                  marginTop: "8px",
                }}
              >
                <h4
                  className="font-bold text-main m-0"
                  style={{ marginBottom: "16px", fontSize: "1rem" }}
                >
                  Horario de Atención
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    fontSize: "0.9rem",
                  }}
                >
                  <div className="flex justify-between">
                    <span className="text-muted">Lunes - Viernes</span>
                    <span className="font-semibold text-main">
                      9:00 - 20:00
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Sábados</span>
                    <span className="font-semibold text-main">
                      10:00 - 14:00
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Domingos</span>
                    <span className="font-semibold text-muted">Cerrado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div
              className="card bg-card"
              style={{
                padding: "32px",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
              }}
            >
              <h3
                className="font-bold text-main m-0"
                style={{ fontSize: "1.15rem", marginBottom: "24px" }}
              >
                Envíanos un mensaje
              </h3>
              <form
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
                onSubmit={(e) => e.preventDefault()}
              >
                <div>
                  <label
                    className="label"
                    style={{
                      fontSize: "0.85rem",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Tu nombre"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label
                    className="label"
                    style={{
                      fontSize: "0.85rem",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="tu@email.com"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label
                    className="label"
                    style={{
                      fontSize: "0.85rem",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Teléfono
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="+34 600 000 000"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label
                    className="label"
                    style={{
                      fontSize: "0.85rem",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Mensaje
                  </label>
                  <textarea
                    className="input-field"
                    rows="4"
                    placeholder="¿En qué podemos ayudarte?"
                    style={{ width: "100%", resize: "vertical" }}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full shadow-md"
                  style={{
                    padding: "14px",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  Enviar mensaje <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
