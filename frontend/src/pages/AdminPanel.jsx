/**
 * Panel de administración del concesionario.
 *
 * Acceso restringido al rol "admin" tanto en el frontend (AdminRoute)
 * como en el backend (Spring Security + @PreAuthorize). Si un cliente
 * intenta acceder, el backend rechaza con 403.
 *
 * Pestañas principales:
 *  - Vehículos: alta, edición, eliminación, asignación de imágenes,
 *               importación masiva (CSV/XLSX) y generación de
 *               descripciones comerciales con IA.
 *  - Usuarios:  listado, edición de datos básicos y cambio de rol.
 *  - Analytics: dashboard de KPIs (delegado en AnalyticsDashboard).
 *
 * Todas las operaciones envían el JWT en la cabecera Authorization.
 */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Search, X, ImagePlus, Upload, FileText, CheckCircle2, AlertCircle, Users, Car, BarChart2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnalyticsDashboard from './AnalyticsDashboard';

const API_URL = import.meta.env.VITE_API_URL;
const FALLBACK_IMAGE = 'https://placehold.co/100x100/1e293b/94a3b8?text=Auto';

const EMPTY_FORM = {
  marca: '', modelo: '', version: '', vin: '', anio: '', kilometros: '',
  precio: '', color: '', descripcion: '', disponible: true,
  carroceriaId: '', transmisionId: '', etiquetaAmbientalId: '',
  combustibleIds: [], equipamientoIds: [],
};

export default function AdminPanel() {
  const { user } = useAuth();
  const authHeader = () => ({ Authorization: `Bearer ${user?.token}` });

  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [carrocerias, setCarrocerias] = useState([]);
  const [transmisiones, setTransmisiones] = useState([]);
  const [combustibles, setCombustibles] = useState([]);
  const [equipamiento, setEquipamiento] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const csvInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('vehiculos');
  const [users, setUsers] = useState([]);
  const [userDeleteConfirm, setUserDeleteConfirm] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('todos');
  const [userStatusFilter, setUserStatusFilter] = useState('todos');
  const [userEditModal, setUserEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ nombre: '', email: '', telefono: '', rol: 'cliente', activo: true });
  const [userSaving, setUserSaving] = useState(false);
  const [userError, setUserError] = useState('');

  const fetchUsers = () => {
    fetch(`${API_URL}/admin/users`, { headers: authHeader() })
      .then(r => { if (!r.ok) return []; return r.json(); })
      .then(data => { if (Array.isArray(data)) setUsers(data); })
      .catch(() => {});
  };

  const fetchCars = () => {
    fetch(`${API_URL}/cars`)
      .then(res => res.json())
      .then(data => setCars(data.reverse()))
      .catch(() => {});
  };

  useEffect(() => {
    fetchCars();
    fetchUsers();
    fetch(`${API_URL}/catalogo/carrocerias`).then(r => r.json()).then(setCarrocerias).catch(() => {});
    fetch(`${API_URL}/catalogo/transmisiones`).then(r => r.json()).then(setTransmisiones).catch(() => {});
    fetch(`${API_URL}/catalogo/combustibles`).then(r => r.json()).then(setCombustibles).catch(() => {});
    fetch(`${API_URL}/catalogo/equipamiento`).then(r => r.json()).then(setEquipamiento).catch(() => {});
    fetch(`${API_URL}/catalogo/etiquetas-ambientales`).then(r => r.json()).then(setEtiquetas).catch(() => {});
  }, []);

  const filtered = cars.filter(car =>
    `${car.marca} ${car.modelo}`.toLowerCase().includes(search.toLowerCase())
  );

  const resetImageState = () => {
    setImageFiles([]);
    setImagePreviews([]);
  };

  const openAddModal = () => {
    setEditingCar(null);
    setForm(EMPTY_FORM);
    setError('');
    resetImageState();
    setShowModal(true);
  };

  const openEditModal = (car) => {
    setEditingCar(car);
    setForm({
      marca: car.marca || '',
      modelo: car.modelo || '',
      version: car.version || '',
      vin: car.vin || '',
      anio: car.anio || '',
      kilometros: car.kilometros || '',
      precio: car.precio || '',
      color: car.color || '',
      descripcion: car.descripcion || '',
      disponible: car.disponible ?? true,
      carroceriaId: car.carroceria?.id || '',
      transmisionId: car.transmision?.id || '',
      etiquetaAmbientalId: car.etiquetaAmbiental?.id || '',
      combustibleIds: car.combustibles?.map(c => c.id) || [],
      equipamientoIds: car.equipamiento?.map(e => e.id) || [],
    });
    setError('');
    resetImageState();
    setShowModal(true);
  };

  const handleToggleMulti = (field, id) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(id) ? f[field].filter(x => x !== id) : [...f[field], id],
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setImagePreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const uploadImages = async (carId) => {
    const urls = [];
    for (const file of imageFiles) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_URL}/upload/image`, { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        urls.push(data.url);
      }
    }
    if (urls.length > 0) {
      const body = urls.map((url, i) => ({ url, esPrincipal: i === 0 }));
      await fetch(`${API_URL}/cars/${carId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(body),
      });
    }
  };

  const handleGenerateDescription = async () => {
    setGeneratingDesc(true);
    try {
      const res = await fetch(`${API_URL}/cars/generate-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          marca: form.marca,
          modelo: form.modelo,
          version: form.version,
          precio: form.precio,
          color: form.color,
          kilometros: form.kilometros,
        }),
      });
      if (!res.ok) throw new Error('Error al generar descripción');
      const data = await res.json();
      setForm(f => ({ ...f, descripcion: data.descripcion }));
    } catch {
      setError('No se pudo generar la descripción. Inténtalo de nuevo.');
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const body = {
      ...form,
      anio: form.anio ? parseInt(form.anio) : null,
      kilometros: form.kilometros ? parseInt(form.kilometros) : null,
      precio: form.precio ? parseFloat(form.precio) : null,
      carroceriaId: form.carroceriaId ? parseInt(form.carroceriaId) : null,
      transmisionId: form.transmisionId ? parseInt(form.transmisionId) : null,
      etiquetaAmbientalId: form.etiquetaAmbientalId ? parseInt(form.etiquetaAmbientalId) : null,
    };

    try {
      const url = editingCar ? `${API_URL}/cars/${editingCar.id}` : `${API_URL}/cars/new`;
      const method = editingCar ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Error al guardar el vehículo');
      const savedCar = await res.json();
      if (imageFiles.length > 0) {
        await uploadImages(savedCar.id);
      }
      setShowModal(false);
      fetchCars();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/cars/${id}`, { method: 'DELETE', headers: authHeader() });
      setCars(prev => prev.filter(c => c.id !== id));
    } catch {
      // La UI ya no muestra el coche eliminado optimísticamente — no hay acción adicional
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    const fd = new FormData();
    fd.append('file', importFile);
    try {
      const res = await fetch(`${API_URL}/cars/import`, {
        method: 'POST',
        headers: authHeader(),
        body: fd,
      });
      const text = await res.text();
      setImportResult({ ok: res.ok, message: text });
      if (res.ok) fetchCars();
    } catch {
      setImportResult({ ok: false, message: 'Error de conexión al importar.' });
    } finally {
      setImporting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = `${u.nombre} ${u.email}`.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === 'todos' || u.rol === userRoleFilter;
    const matchStatus = userStatusFilter === 'todos' || (userStatusFilter === 'activo' ? u.activo : !u.activo);
    return matchSearch && matchRole && matchStatus;
  });

  const openUserEdit = (u) => {
    setEditingUser(u);
    setUserForm({ nombre: u.nombre, email: u.email, telefono: u.telefono || '', rol: u.rol, activo: u.activo });
    setUserError('');
    setUserEditModal(true);
  };

  const handleUserEdit = async (e) => {
    e.preventDefault();
    setUserSaving(true);
    setUserError('');
    try {
      const res = await fetch(`${API_URL}/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(userForm),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Error al guardar');
      }
      setUserEditModal(false);
      fetchUsers();
    } catch (err) {
      setUserError(err.message);
    } finally {
      setUserSaving(false);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('es-ES').format(price) + '€';

  return (
    <div className="page-container" style={{ maxWidth: '1200px' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/" className="text-muted flex items-center mb-4 hover-primary no-underline font-medium text-sm">
            <ArrowLeft size={16} className="mr-2" /> Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted text-sm mt-1">
            {activeTab === 'vehiculos' ? `${cars.length} vehículos en total` : `${users.length} usuarios registrados`}
          </p>
        </div>
        {activeTab === 'vehiculos' && (
          <div className="flex gap-3">
            <button
              onClick={() => { setShowImportModal(true); setImportFile(null); setImportResult(null); }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}
            >
              <Upload size={17} /> Importar CSV / Excel
            </button>
            <button className="btn-primary shadow-md" onClick={openAddModal}>
              <Plus size={18} /> Añadir Vehículo
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="card mb-6 flex divide-x divide-border" style={{ padding: 0, overflow: 'hidden' }}>
        <button
          style={{ flex: 1, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', background: activeTab === 'vehiculos' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'vehiculos' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'vehiculos' ? '2px solid var(--primary)' : '2px solid transparent', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s' }}
          onClick={() => setActiveTab('vehiculos')}
        >
          <Car size={17} /> Vehículos
        </button>
        <button
          style={{ flex: 1, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', background: activeTab === 'usuarios' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'usuarios' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'usuarios' ? '2px solid var(--primary)' : '2px solid transparent', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s' }}
          onClick={() => setActiveTab('usuarios')}
        >
          <Users size={17} /> Usuarios
        </button>
        <button
          style={{ flex: 1, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', background: activeTab === 'analiticas' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'analiticas' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'analiticas' ? '2px solid var(--primary)' : '2px solid transparent', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s' }}
          onClick={() => setActiveTab('analiticas')}
        >
          <BarChart2 size={17} /> Analíticas
        </button>
      </div>

      {activeTab === 'analiticas' && (
        <AnalyticsDashboard authHeader={authHeader} />
      )}

      {activeTab === 'vehiculos' && (<>
      {/* Search bar */}
      <div className="search-bar" style={{ maxWidth: '400px', marginBottom: '24px' }}>
        <Search size={18} className="text-muted" />
        <input
          className="search-input"
          placeholder="Buscar por marca o modelo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <X size={16} className="text-muted" />
          </button>
        )}
      </div>

      {/* Vehicles Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-hover text-muted text-xs uppercase tracking-wider font-semibold border-b border-border">
              <th className="p-4 px-6 w-16">#</th>
              <th className="p-4">Vehículo</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Precio</th>
              <th className="p-4">KM</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted">No se encontraron vehículos</td></tr>
            )}
            {filtered.map((car, idx) => {
              const imageSrc = car.imagenes && car.imagenes.length > 0 ? car.imagenes[0].url : FALLBACK_IMAGE;
              return (
                <tr key={car.id || idx} className="hover:bg-hover/50 transition-colors">
                  <td className="p-4 px-6 text-sm font-medium text-muted">{idx + 1}</td>
                  <td className="p-4 flex items-center gap-4">
                    <img src={imageSrc} alt={car.modelo} className="w-16 h-12 rounded object-cover border border-border" onError={e => { e.target.src = FALLBACK_IMAGE; }} />
                    <div>
                      <p className="font-bold text-sm text-main">{car.marca} {car.modelo}</p>
                      <p className="text-xs text-muted leading-tight">{car.version}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted">{car.carroceria?.nombre || '—'}</td>
                  <td className="p-4 text-sm font-bold">{formatPrice(car.precio)}</td>
                  <td className="p-4 text-sm text-muted">{car.kilometros?.toLocaleString('es-ES') || '0'} km</td>
                  <td className="p-4">
                    <span className={`badge ${car.disponible ? 'success' : 'warning'}`}>{car.disponible ? 'Disponible' : 'Reservado'}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEditModal(car)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--primary)', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                        <Edit2 size={14} /> Editar
                      </button>
                      <button onClick={() => setDeleteConfirm(car)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--danger)', background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </>)}

      {activeTab === 'usuarios' && (<>
      {/* Filtros usuarios */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: '1 1 220px', minWidth: 0 }}>
          <Search size={18} className="text-muted" />
          <input
            className="search-input"
            placeholder="Buscar por nombre o email..."
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
          />
          {userSearch && (
            <button onClick={() => setUserSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
              <X size={16} className="text-muted" />
            </button>
          )}
        </div>
        <select
          value={userRoleFilter}
          onChange={e => setUserRoleFilter(e.target.value)}
          className="input-field"
          style={{ width: 'auto', minWidth: '140px' }}
        >
          <option value="todos">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="cliente">Cliente</option>
        </select>
        <select
          value={userStatusFilter}
          onChange={e => setUserStatusFilter(e.target.value)}
          className="input-field"
          style={{ width: 'auto', minWidth: '150px' }}
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-hover text-muted text-xs uppercase tracking-wider font-semibold border-b border-border">
              <th className="p-4 px-6 w-16">#</th>
              <th className="p-4">Nombre</th>
              <th className="p-4">Email</th>
              <th className="p-4">Teléfono</th>
              <th className="p-4">Rol</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted">No se encontraron usuarios</td></tr>
            )}
            {filteredUsers.map((u, idx) => (
              <tr key={u.id} className="hover:bg-hover/50 transition-colors">
                <td className="p-4 px-6 text-sm font-medium text-muted">{idx + 1}</td>
                <td className="p-4 text-sm font-semibold text-main">{u.nombre}</td>
                <td className="p-4 text-sm text-muted">{u.email}</td>
                <td className="p-4 text-sm text-muted">{u.telefono || '—'}</td>
                <td className="p-4">
                  <span className={`badge ${u.rol === 'admin' ? 'warning' : 'success'}`}>{u.rol}</span>
                </td>
                <td className="p-4">
                  <span className={`badge ${u.activo ? 'success' : 'danger'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openUserEdit(u)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--primary)', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                      <Edit2 size={14} /> Editar
                    </button>
                    <button onClick={() => setUserDeleteConfirm(u)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--danger)', background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>)}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: 0 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="text-xl font-bold text-main">Importar vehículos desde CSV</h3>
              <button onClick={() => setShowImportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Formato esperado */}
              <div style={{ background: 'var(--bg-hover)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border-color)' }}>
                <p className="text-sm font-bold text-main" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={15} /> Columnas requeridas (fila 1 = cabecera):
                </p>
                <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.7, display: 'block' }}>
                  Marca · Modelo · Version · Precio · Kilometros · Color · Descripcion · CarroceriaId
                </code>
                <p className="text-xs text-muted" style={{ marginTop: '8px' }}>
                  Formatos admitidos: <strong>.csv</strong> y <strong>.xlsx</strong> (Excel). CarroceriaId es opcional.
                </p>
              </div>

              {/* Selector de archivo */}
              <div>
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv,.xlsx"
                  style={{ display: 'none' }}
                  onChange={e => { setImportFile(e.target.files[0] || null); setImportResult(null); }}
                />
                <button
                  onClick={() => csvInputRef.current.click()}
                  style={{ width: '100%', padding: '14px', border: '2px dashed var(--border-color)', borderRadius: '10px', background: 'var(--bg-hover)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}
                >
                  <Upload size={22} />
                  <span className="text-sm font-medium">{importFile ? importFile.name : 'Seleccionar archivo .csv o .xlsx'}</span>
                </button>
              </div>

              {/* Resultado */}
              {importResult && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '14px', borderRadius: '10px', background: importResult.ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${importResult.ok ? '#10B981' : 'var(--danger)'}` }}>
                  {importResult.ok
                    ? <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    : <AlertCircle size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />}
                  <p className="text-sm font-medium" style={{ color: importResult.ok ? '#10B981' : 'var(--danger)', margin: 0 }}>{importResult.message}</p>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowImportModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-hover)', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                  Cerrar
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importFile || importing}
                  className="btn-primary"
                  style={{ opacity: !importFile || importing ? 0.5 : 1 }}
                >
                  {importing ? 'Importando...' : 'Importar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirm Modal */}
      {userDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setUserDeleteConfirm(null)}>
          <div className="card p-8" style={{ maxWidth: '420px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-main mb-3">Eliminar usuario</h3>
            <p className="text-muted mb-6">
              ¿Seguro que quieres eliminar la cuenta de <strong className="text-main">{userDeleteConfirm.nombre}</strong> ({userDeleteConfirm.email})?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', color: 'var(--text-main)', fontFamily: 'var(--font-ui)' }} onClick={() => setUserDeleteConfirm(null)}>
                Cancelar
              </button>
              <button className="btn-primary" style={{ background: 'var(--danger)' }} onClick={async () => {
                await fetch(`${API_URL}/admin/users/${userDeleteConfirm.id}`, { method: 'DELETE', headers: authHeader() });
                setUsers(prev => prev.filter(u => u.id !== userDeleteConfirm.id));
                setUserDeleteConfirm(null);
              }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Vehicle Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="card p-8" style={{ maxWidth: '420px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-main mb-3">Eliminar vehículo</h3>
            <p className="text-muted mb-6">
              ¿Seguro que quieres eliminar <strong className="text-main">{deleteConfirm.marca} {deleteConfirm.modelo}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', color: 'var(--text-main)', fontFamily: 'var(--font-ui)' }}
                onClick={() => setDeleteConfirm(null)}
              >
                Cancelar
              </button>
              <button className="btn-primary" style={{ background: 'var(--danger)' }} onClick={() => handleDelete(deleteConfirm.id)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {userEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setUserEditModal(false)}>
          <div className="card" style={{ maxWidth: '480px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="text-xl font-bold text-main">Editar usuario</h3>
              <button onClick={() => setUserEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleUserEdit} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label">Nombre</label>
                <input className="input-field" required value={userForm.nombre} onChange={e => setUserForm(f => ({ ...f, nombre: e.target.value }))} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input-field" type="email" required value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input className="input-field" value={userForm.telefono} onChange={e => setUserForm(f => ({ ...f, telefono: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="label">Rol</label>
                  <select className="input-field" value={userForm.rol} onChange={e => setUserForm(f => ({ ...f, rol: e.target.value }))}>
                    <option value="cliente">Cliente</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="label">Estado</label>
                  <select className="input-field" value={userForm.activo ? 'true' : 'false'} onChange={e => setUserForm(f => ({ ...f, activo: e.target.value === 'true' }))}>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>
              {userError && <p className="error-text">{userError}</p>}
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setUserEditModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-hover)', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={userSaving}>
                  {userSaving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="card"
            style={{ maxWidth: '720px', width: '100%', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between" style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-color)' }}>
              <h2 className="text-xl font-bold text-main">
                {editingCar ? 'Editar Vehículo' : 'Añadir Vehículo'}
              </h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Marca & Modelo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="label">Marca *</label>
                  <input className="input-field" required value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Modelo *</label>
                  <input className="input-field" required value={form.modelo} onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))} />
                </div>
              </div>

              {/* Versión & VIN */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="label">Versión</label>
                  <input className="input-field" value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} />
                </div>
                <div>
                  <label className="label">VIN</label>
                  <input className="input-field" value={form.vin} onChange={e => setForm(f => ({ ...f, vin: e.target.value }))} />
                </div>
              </div>

              {/* Año, Kilómetros, Precio */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="label">Año *</label>
                  <input className="input-field" required type="number" min="1900" max="2100" value={form.anio} onChange={e => setForm(f => ({ ...f, anio: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Kilómetros *</label>
                  <input className="input-field" required type="number" min="0" value={form.kilometros} onChange={e => setForm(f => ({ ...f, kilometros: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Precio (€) *</label>
                  <input className="input-field" required type="number" min="0" step="0.01" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} />
                </div>
              </div>

              {/* Color & Estado */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="label">Color</label>
                  <input className="input-field" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Estado</label>
                  <select className="input-field" value={form.disponible} onChange={e => setForm(f => ({ ...f, disponible: e.target.value === 'true' }))}>
                    <option value="true">Disponible</option>
                    <option value="false">Reservado</option>
                  </select>
                </div>
              </div>

              {/* Carrocería, Transmisión, Etiqueta */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="label">Carrocería</label>
                  <select className="input-field" value={form.carroceriaId} onChange={e => setForm(f => ({ ...f, carroceriaId: e.target.value }))}>
                    <option value="">— Seleccionar —</option>
                    {carrocerias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Transmisión</label>
                  <select className="input-field" value={form.transmisionId} onChange={e => setForm(f => ({ ...f, transmisionId: e.target.value }))}>
                    <option value="">— Seleccionar —</option>
                    {transmisiones.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Etiqueta Ambiental</label>
                  <select className="input-field" value={form.etiquetaAmbientalId} onChange={e => setForm(f => ({ ...f, etiquetaAmbientalId: e.target.value }))}>
                    <option value="">— Seleccionar —</option>
                    {etiquetas.map(et => <option key={et.id} value={et.id}>{et.nombre}</option>)}
                  </select>
                </div>
              </div>

              {/* Combustible */}
              {combustibles.length > 0 && (
                <div>
                  <label className="label">Combustible</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '14px', background: 'var(--bg-hover)', borderRadius: '8px' }}>
                    {combustibles.map(c => (
                      <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        <input type="checkbox" checked={form.combustibleIds.includes(c.id)} onChange={() => handleToggleMulti('combustibleIds', c.id)} />
                        {c.nombre}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipamiento */}
              {equipamiento.length > 0 && (
                <div>
                  <label className="label">Equipamiento Destacado</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', maxHeight: '180px', overflowY: 'auto', padding: '14px', background: 'var(--bg-hover)', borderRadius: '8px' }}>
                    {equipamiento.map(eq => (
                      <label key={eq.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                        <input type="checkbox" checked={form.equipamientoIds.includes(eq.id)} onChange={() => handleToggleMulti('equipamientoIds', eq.id)} />
                        {eq.nombre}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Descripción */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="label" style={{ margin: 0 }}>Descripción</label>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={generatingDesc || (!form.marca && !form.modelo)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '4px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600,
                      background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer',
                      opacity: (generatingDesc || (!form.marca && !form.modelo)) ? 0.5 : 1,
                    }}
                  >
                    <Sparkles size={13} />
                    {generatingDesc ? 'Generando...' : 'Generar con IA'}
                  </button>
                </div>
                <textarea
                  className="input-field"
                  rows={3}
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Imágenes */}
              <div>
                <label className="label">Imágenes del vehículo</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '14px 16px',
                    border: '2px dashed var(--border-input)', borderRadius: '10px',
                    background: 'var(--bg-hover)', color: 'var(--text-muted)',
                    cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.9rem',
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-input)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <ImagePlus size={20} />
                  {imageFiles.length > 0 ? `${imageFiles.length} imagen(es) seleccionada(s) — añadir más` : 'Seleccionar imágenes desde el dispositivo'}
                </button>

                {imagePreviews.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                    {imagePreviews.map((src, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={src} alt={`preview-${i}`} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                        {i === 0 && (
                          <span style={{ position: 'absolute', bottom: '2px', left: '2px', background: 'var(--primary)', color: 'white', fontSize: '0.6rem', padding: '1px 4px', borderRadius: '4px', fontWeight: 600 }}>Principal</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {editingCar && editingCar.imagenes?.length > 0 && (
                  <p className="text-muted text-xs mt-2">Las imágenes nuevas se añadirán a las existentes del vehículo.</p>
                )}
              </div>

              {error && <p className="error-text">{error}</p>}

              <div className="flex gap-3 justify-end" style={{ paddingTop: '4px' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', color: 'var(--text-main)', fontFamily: 'var(--font-ui)' }}
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : editingCar ? 'Guardar cambios' : 'Crear vehículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
