import { useState, useEffect } from 'react';
import { Car, Users, MessageSquare, MessageCircle, Loader } from 'lucide-react';
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
    { label: 'Mensajes', value: data.totalMensajes, Icon: MessageCircle, color: 'var(--warning)', bg: 'var(--warning-bg)' },
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

      {/* Series temporales */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
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
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
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
        <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
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
        <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
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
