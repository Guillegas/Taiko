import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, CreditCard, Lock, Edit2, Check, X } from 'lucide-react';

const API_URL = 'http://localhost:8080/api';

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personales');

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/" className="text-muted flex items-center mb-4 hover-primary no-underline font-medium text-sm">
            <ArrowLeft size={16} className="mr-2" /> Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>
          <p className="text-muted">Gestiona tu información personal y preferencias</p>
        </div>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1px solid var(--primary)', flexShrink: 0 }}>
          <User size={32} />
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6 flex divide-x divide-border" style={{ padding: 0, overflow: 'hidden' }}>
        <button
          style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer', background: activeTab === 'personales' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'personales' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'personales' ? '2px solid var(--primary)' : '2px solid transparent', fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s' }}
          onClick={() => setActiveTab('personales')}
        >
          <User size={20} />
          Datos Personales
        </button>
        {user?.role !== 'admin' && (
          <button
            style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer', background: activeTab === 'bancarios' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'bancarios' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'bancarios' ? '2px solid var(--primary)' : '2px solid transparent', fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s' }}
            onClick={() => setActiveTab('bancarios')}
          >
            <CreditCard size={20} />
            Datos Bancarios
          </button>
        )}
        <button
          style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer', background: activeTab === 'seguridad' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'seguridad' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'seguridad' ? '2px solid var(--primary)' : '2px solid transparent', fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s' }}
          onClick={() => setActiveTab('seguridad')}
        >
          <Lock size={20} />
          Seguridad
        </button>
      </div>

      {/* Tab Content */}
      <div className="card p-8">
        {activeTab === 'personales' && <PersonalDataForm token={user?.token} />}
        {activeTab === 'bancarios' && user?.role !== 'admin' && <BankDataForm />}
        {activeTab === 'seguridad' && <SecurityForm token={user?.token} />}
      </div>
    </div>
  );
}

function PersonalDataForm({ token }) {
  const { updateUsername } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [profile, setProfile] = useState({ nombre: '', email: '', telefono: '' });
  const [form, setForm] = useState({ nombre: '', telefono: '' });

  useEffect(() => {
    fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setForm({ nombre: data.nombre || '', telefono: data.telefono || '' });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const handleEdit = () => {
    setForm({ nombre: profile.nombre || '', telefono: profile.telefono || '' });
    setError('');
    setSuccess(false);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre: form.nombre, telefono: form.telefono }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `Error ${res.status}`);
      }
      const updated = await res.json();
      setProfile(updated);
      if (updated.nombre) updateUsername(updated.nombre);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted">Cargando...</p>;

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Información Personal</h2>
        {!editing ? (
          <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }} onClick={handleEdit}>
            <Edit2 size={15} /> Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem', background: 'var(--bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }} onClick={handleCancel}>
              <X size={15} /> Cancelar
            </button>
            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }} onClick={handleSave} disabled={saving}>
              <Check size={15} /> {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </div>

      {success && (
        <div className="alert-box info mb-6">
          <Check size={18} className="text-primary" />
          <span className="text-sm font-medium text-primary">Datos actualizados correctamente.</span>
        </div>
      )}
      {error && <p className="error-text mb-4">{error}</p>}

      <div className="flex flex-col gap-5">
        <div className="form-group">
          <label className="label">Nombre</label>
          {editing ? (
            <input
              type="text"
              className="input-field"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
            />
          ) : (
            <input type="text" className="input-field" value={profile.nombre || '—'} disabled />
          )}
        </div>

        <div className="form-group">
          <label className="label">Email</label>
          <input type="email" className="input-field" value={profile.email || '—'} disabled />
        </div>

        <div className="form-group">
          <label className="label">Teléfono</label>
          {editing ? (
            <input
              type="text"
              className="input-field"
              value={form.telefono}
              onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
            />
          ) : (
            <input type="text" className="input-field" value={profile.telefono || '—'} disabled />
          )}
        </div>
      </div>
    </div>
  );
}

function BankDataForm() {
  return (
    <div className="animate-fade-in-up">
      <h2 className="text-xl font-bold mb-6">Datos Bancarios</h2>
      <div className="alert-box info mb-6">
        <CreditCard size={20} className="text-primary" />
        <span className="text-sm font-medium text-primary">Tus datos bancarios están protegidos y encriptados. Solo se utilizarán para procesar pagos y devoluciones.</span>
      </div>
      <div className="flex flex-col gap-6">
        <div className="form-group">
          <label className="label">IBAN</label>
          <input type="text" className="input-field font-mono" defaultValue="ES91 2100 0418 4502 0005 1332" />
        </div>
        <div className="form-group">
          <label className="label">Titular de la Cuenta</label>
          <input type="text" className="input-field" defaultValue="Juan García Martínez" />
        </div>
        <div className="form-group">
          <label className="label">Entidad Bancaria</label>
          <input type="text" className="input-field" defaultValue="Banco Santander" />
        </div>
        <div>
          <button className="btn-primary mt-2">
            <Lock size={16} /> Guardar Datos Bancarios
          </button>
        </div>
      </div>
    </div>
  );
}

function SecurityForm({ token }) {
  const [form, setForm] = useState({ passwordActual: '', passwordNueva: '', passwordConfirm: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.passwordNueva !== form.passwordConfirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: form.passwordNueva }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `Error ${res.status}`);
      }
      setSuccess(true);
      setForm({ passwordActual: '', passwordNueva: '', passwordConfirm: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-xl font-bold mb-6">Seguridad y Contraseña</h2>
      <div className="alert-box warning mb-6">
        <Lock size={20} className="text-warning" />
        <span className="text-sm font-medium text-warning">Asegúrate de usar una contraseña segura que contenga letras mayúsculas, minúsculas, números y símbolos.</span>
      </div>
      {success && (
        <div className="alert-box info mb-6">
          <Check size={18} className="text-primary" />
          <span className="text-sm font-medium text-primary">Contraseña actualizada correctamente.</span>
        </div>
      )}
      {error && <p className="error-text mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 mb-10">
        <div className="form-group">
          <label className="label">Nueva Contraseña</label>
          <input type="password" className="input-field" value={form.passwordNueva} onChange={e => setForm(f => ({ ...f, passwordNueva: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="label">Confirmar Nueva Contraseña</label>
          <input type="password" className="input-field" value={form.passwordConfirm} onChange={e => setForm(f => ({ ...f, passwordConfirm: e.target.value }))} required />
        </div>
        <div>
          <button type="submit" className="btn-primary mt-2" disabled={saving}>
            <Lock size={16} /> {saving ? 'Guardando...' : 'Cambiar Contraseña'}
          </button>
        </div>
      </form>
    </div>
  );
}
