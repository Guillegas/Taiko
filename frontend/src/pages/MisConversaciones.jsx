import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Trash2, Bot, Plus, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function MisConversaciones() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversaciones, setConversaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const authHeader = () => ({ Authorization: `Bearer ${user?.token}` });

  useEffect(() => {
    fetch(`${API_URL}/chat/mis-conversaciones`, { headers: authHeader() })
      .then(res => res.json())
      .then(data => { setConversaciones(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    const strId = String(id);
    const previous = conversaciones;
    setConversaciones(prev => prev.filter(c => String(c.id) !== strId));
    setDeleteConfirm(null);

    try {
      const res = await fetch(`${API_URL}/chat/conversaciones/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      if (!res.ok) {
        setConversaciones(previous);
        return;
      }
      if (localStorage.getItem('taiko_conv_id') === strId) {
        localStorage.removeItem('taiko_conv_id');
      }
    } catch {
      setConversaciones(previous);
    }
  };

  const openConversacion = (id) => {
    localStorage.setItem('taiko_conv_id', id);
    navigate(`/chat?conv=${id}`);
  };

  const handleDownload = async (convId, format, e) => {
    e.stopPropagation();
    const res = await fetch(`${API_URL}/chat/${convId}/export/${format}`, { headers: authHeader() });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversacion_${String(convId).substring(0, 8)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async (convId, e) => {
    e.stopPropagation();
    const res = await fetch(`${API_URL}/chat/${convId}/history`);
    if (!res.ok) return;
    const historial = await res.json();
    const now = new Date().toLocaleString('es-ES');
    const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"/>
<title>Conversación - ${now}</title>
<style>
  body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;color:#1e293b;}
  h1{font-size:1.4rem;border-bottom:2px solid #2563eb;padding-bottom:12px;margin-bottom:8px;}
  .meta{color:#64748b;font-size:.85rem;margin-bottom:32px;}
  .msg{margin-bottom:20px;display:flex;flex-direction:column;}
  .msg.cliente{align-items:flex-end;} .msg.chatbot{align-items:flex-start;}
  .label{font-size:.75rem;font-weight:700;margin-bottom:4px;color:#64748b;text-transform:uppercase;}
  .bubble{padding:12px 16px;border-radius:12px;max-width:75%;font-size:.95rem;line-height:1.6;}
  .cliente .bubble{background:#2563eb;color:white;} .chatbot .bubble{background:#f1f5f9;border:1px solid #e2e8f0;}
  @media print{body{margin:20px;}}
</style></head><body>
<h1>Conversación con Asistente TAIKO</h1>
<div class="meta">Exportado el ${now}</div>
${historial.map(m => `<div class="msg ${m.emisor}"><div class="label">${m.emisor === 'cliente' ? 'Tú' : 'Asistente'}</div><div class="bubble">${m.contenido.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')}</div></div>`).join('')}
</body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.onload = () => win.print();
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="mb-8">
        <Link to="/chat" className="text-muted flex items-center mb-4 hover-primary no-underline font-medium text-sm">
          <ArrowLeft size={16} className="mr-2" /> Volver al chat
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Mis Conversaciones</h1>
            <p className="text-muted text-sm">{conversaciones.length} conversación{conversaciones.length !== 1 ? 'es' : ''} guardada{conversaciones.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn-primary" onClick={() => { localStorage.removeItem('taiko_conv_id'); navigate('/chat'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Nueva conversación
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted">Cargando...</p>
      ) : conversaciones.length === 0 ? (
        <div className="card p-8 text-center">
          <Bot size={48} className="text-muted" style={{ margin: '0 auto 16px' }} />
          <h3 className="text-lg font-semibold mb-2">Sin conversaciones aún</h3>
          <p className="text-muted mb-6">Empieza a chatear con el asistente y tus conversaciones aparecerán aquí.</p>
          <Link to="/chat" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={16} /> Ir al chat
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {conversaciones.map(conv => (
            <div key={conv.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
              onClick={() => openConversacion(conv.id)}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={20} className="text-primary" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {conv.preview || 'Conversación sin mensajes'}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {formatFecha(conv.fechaInicio)} · {conv.totalMensajes} mensaje{conv.totalMensajes !== 1 ? 's' : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                {['pdf', 'txt', 'json'].map(fmt => (
                  <button
                    key={fmt}
                    onClick={e => fmt === 'pdf' ? handleDownloadPDF(conv.id, e) : handleDownload(conv.id, fmt, e)}
                    title={`Descargar como ${fmt.toUpperCase()}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-hover)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)', textTransform: 'uppercase' }}
                  >
                    <Download size={12} /> {fmt}
                  </button>
                ))}
                <button
                  onClick={e => { e.stopPropagation(); setDeleteConfirm(conv.id); }}
                  className="btn-icon"
                  style={{ color: 'var(--text-muted)' }}
                  title="Eliminar conversación"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmación de borrado */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ maxWidth: '380px', width: '100%', padding: '28px', textAlign: 'center' }}>
            <Trash2 size={36} style={{ margin: '0 auto 12px', color: 'var(--error)' }} />
            <h3 className="text-lg font-bold mb-2">¿Eliminar conversación?</h3>
            <p className="text-muted mb-6" style={{ fontSize: '0.9rem' }}>Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-center">
              <button style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-ui)', color: 'var(--text-muted)' }}
                onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'var(--error, #ef4444)', color: 'white', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 600 }}
                onClick={() => handleDelete(deleteConfirm)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
