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
        <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-primary border border-primary-light">
          <User size={32} />
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6 flex divide-x divide-border">
        <button
          className={`flex-1 py-4 flex flex-col items-center justify-center gap-2 transition-colors ${activeTab === 'personales' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:bg-hover'}`}
          onClick={() => setActiveTab('personales')}
        >
          <User size={20} />
          <span className="text-sm font-medium">Datos Personales</span>
        </button>
        {user?.role !== 'admin' && (
          <button
            className={`flex-1 py-4 flex flex-col items-center justify-center gap-2 transition-colors ${activeTab === 'bancarios' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:bg-hover'}`}
            onClick={() => setActiveTab('bancarios')}
          >
            <CreditCard size={20} />
            <span className="text-sm font-medium">Datos Bancarios</span>
          </button>
        )}
        <button
          className={`flex-1 py-4 flex flex-col items-center justify-center gap-2 transition-colors ${activeTab === 'seguridad' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:bg-hover'}`}
          onClick={() => setActiveTab('seguridad')}
        >
          <Lock size={20} />
          <span className="text-sm font-medium">Seguridad</span>
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
      if (!res.ok) throw new Error('Error al guardar');
      const updated = await res.json();
      setProfile(updated);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('No se pudieron guardar los cambios.');
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
          <button className="flex items-center text-primary font-medium gap-2 text-sm" onClick={handleEdit}>
            <Edit2 size={16} /> Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-hover)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}
            >
              <X size={14} /> Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--primary)', background: 'var(--primary)', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}
            >
              <Check size={14} /> {saving ? 'Guardando...' : 'Guardar'}
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
      if (!res.ok) throw new Error('Error al cambiar la contraseña');
      setSuccess(true);
      setForm({ passwordActual: '', passwordNueva: '', passwordConfirm: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('No se pudo cambiar la contraseña.');
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
