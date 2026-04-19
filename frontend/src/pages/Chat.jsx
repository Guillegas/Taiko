import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, ArrowLeft, Download, Gauge, Palette, Tag, Plus, Trash2, MessageSquare } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;
const WELCOME_TEXT = '¡Hola! Soy el asistente virtual especialista de AutoElite. Estoy conectado a nuestro inventario en tiempo real. ¿En qué puedo ayudarte hoy para encontrar tu coche ideal?';

export default function ChatPage() {
  const { user, setIsLoginModalOpen, setLoginModalTab } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [convId, setConvId] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const messagesEndRef = useRef(null);

  const authHeader = () => ({ Authorization: `Bearer ${user?.token}` });

  const fetchConversations = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/chat/mis-conversaciones`, { headers: authHeader() });
      if (res.ok) setConversations(await res.json());
    } catch {}
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const startNewConversation = async (token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await fetch(`${API_URL}/chat/start`, { method: 'POST', headers });
      if (res.ok) {
        const data = await res.json();
        setConvId(data.id);
        localStorage.setItem('taiko_conv_id', data.id);
        setMessages([{ role: 'assistant', text: WELCOME_TEXT, vehiculos: [] }]);
        fetchConversations();
      }
    } catch {
      setMessages([{ role: 'assistant', text: 'Problemas de conexión con el servidor.', vehiculos: [] }]);
    }
  };

  const loadConversation = async (id) => {
    try {
      const res = await fetch(`${API_URL}/chat/${id}/history`);
      if (res.ok) {
        const historial = await res.json();
        const mapped = historial.map(m => ({
          role: m.emisor === 'cliente' ? 'user' : 'assistant',
          text: m.contenido,
          vehiculos: m.vehiculos || [],
        }));
        setConvId(id);
        localStorage.setItem('taiko_conv_id', id);
        setMessages([{ role: 'assistant', text: WELCOME_TEXT, vehiculos: [] }, ...mapped]);
      }
    } catch {}
  };

  const prevUserRef = useRef(user);
  useEffect(() => {
    const prev = prevUserRef.current;
    prevUserRef.current = user;

    if (prev && !user) {
      // Usuario acaba de cerrar sesión — limpiar chat y empezar conversación anónima
      localStorage.removeItem('taiko_conv_id');
      setConversations([]);
      setMessages([]);
      setConvId(null);
      startNewConversation(null);
    } else if (!prev && user) {
      // Usuario acaba de iniciar sesión — crear conversación asociada a su cuenta
      localStorage.removeItem('taiko_conv_id');
      setMessages([]);
      setConvId(null);
      startNewConversation(user.token);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const convParam = searchParams.get('conv');
    const initChat = async () => {
      const idToLoad = convParam || localStorage.getItem('taiko_conv_id');
      if (idToLoad) {
        try {
          const res = await fetch(`${API_URL}/chat/${idToLoad}/history`);
          if (res.ok) {
            const historial = await res.json();
            const mapped = historial.map(m => ({
              role: m.emisor === 'cliente' ? 'user' : 'assistant',
              text: m.contenido,
              vehiculos: m.vehiculos || [],
            }));
            setConvId(idToLoad);
            localStorage.setItem('taiko_conv_id', idToLoad);
            setMessages([{ role: 'assistant', text: WELCOME_TEXT, vehiculos: [] }, ...mapped]);
            return;
          }
        } catch {}
        if (!convParam) localStorage.removeItem('taiko_conv_id');
      }
      await startNewConversation(user?.token);
    };
    initChat();
    fetchConversations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = () => {
    if (!user && messages.length > 1) {
      setShowExitModal(true);
    } else {
      navigate(-1);
    }
  };

  const handleNuevaConversacion = async () => {
    if (!user && messages.length > 1) {
      setShowExitModal(true);
      return;
    }
    localStorage.removeItem('taiko_conv_id');
    setMessages([]);
    setConvId(null);
    await startNewConversation(user?.token);
  };

  const handleDelete = async (id) => {
    const strId = String(id);
    const isActive = String(convId) === strId;
    const remaining = conversations.filter(c => String(c.id) !== strId);

    const previous = conversations;
    setConversations(remaining);
    setDeleteConfirm(null);

    try {
      const res = await fetch(`${API_URL}/chat/conversaciones/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      if (!res.ok) {
        setConversations(previous);
        return;
      }
      if (localStorage.getItem('taiko_conv_id') === strId) {
        localStorage.removeItem('taiko_conv_id');
      }
      if (isActive) {
        const next = remaining[0];
        if (next) {
          await loadConversation(next.id);
        } else {
          setConvId(null);
          setMessages([]);
          await startNewConversation(user?.token);
        }
      }
    } catch {
      setConversations(previous);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !convId) return;

    const userText = inputMsg.trim();
    setInputMsg('');
    setMessages(prev => [...prev, { role: 'user', text: userText, vehiculos: [] }]);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/chat/${convId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: userText }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', text: data.respuesta, vehiculos: data.vehiculos || [] }]);
        fetchConversations();
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: 'Lo siento, ha ocurrido un error al procesar tu solicitud.', vehiculos: [] }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error de conexión con el servidor.', vehiculos: [] }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDownloadFormat = async (format) => {
    if (!convId) return;
    const headers = user ? authHeader() : {};
    const res = await fetch(`${API_URL}/chat/${convId}/export/${format}`, { headers });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversacion_${String(convId).substring(0, 8)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const now = new Date().toLocaleString('es-ES');
    const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"/>
<title>Conversación AutoElite - ${now}</title>
<style>
  body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;color:#1e293b;}
  h1{font-size:1.4rem;border-bottom:2px solid #2563eb;padding-bottom:12px;margin-bottom:8px;}
  .meta{color:#64748b;font-size:.85rem;margin-bottom:32px;}
  .msg{margin-bottom:20px;display:flex;flex-direction:column;}
  .msg.user{align-items:flex-end;} .msg.assistant{align-items:flex-start;}
  .label{font-size:.75rem;font-weight:700;margin-bottom:4px;color:#64748b;text-transform:uppercase;}
  .bubble{padding:12px 16px;border-radius:12px;max-width:75%;font-size:.95rem;line-height:1.6;}
  .user .bubble{background:#2563eb;color:white;} .assistant .bubble{background:#f1f5f9;border:1px solid #e2e8f0;}
  @media print{body{margin:20px;}}
</style></head><body>
<h1>Conversación con Asistente AutoElite</h1>
<div class="meta">Exportado el ${now}</div>
${messages.map(m => `<div class="msg ${m.role}"><div class="label">${m.role === 'user' ? 'Tú' : 'Asistente'}</div><div class="bubble">${m.text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')}</div></div>`).join('')}
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
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', overflow: 'hidden' }} className="animate-fade-in-up">

      {/* Panel lateral para usuarios anónimos */}
      {!user && (
        <div style={{ width: '240px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', flexShrink: 0, padding: '24px', gap: '12px', textAlign: 'center' }}>
          <Bot size={36} className="text-primary" />
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>Guarda tus conversaciones</p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Crea una cuenta gratis para acceder a tu historial desde cualquier dispositivo.</p>
          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: '4px', fontSize: '0.88rem' }}
            onClick={() => { setLoginModalTab('register'); setIsLoginModalOpen(true); }}
          >
            Crear cuenta gratis
          </button>
          <button
            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.85rem' }}
            onClick={() => { setLoginModalTab('login'); setIsLoginModalOpen(true); }}
          >
            Ya tengo cuenta
          </button>
        </div>
      )}

      {/* Sidebar — solo para usuarios con sesión */}
      {user && (
        <div style={{ width: '260px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', flexShrink: 0 }}>
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
            <button
              className="btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' }}
              onClick={handleNuevaConversacion}
            >
              <Plus size={15} /> Nueva conversación
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {conversations.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', padding: '24px 12px' }}>
                Sin conversaciones guardadas
              </p>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '9px 10px', borderRadius: '8px', cursor: 'pointer',
                    background: convId === conv.id ? 'var(--primary-light)' : 'transparent',
                    marginBottom: '2px', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (convId !== conv.id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { if (convId !== conv.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <MessageSquare size={14} style={{ color: convId === conv.id ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: convId === conv.id ? 600 : 400, color: convId === conv.id ? 'var(--primary)' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.preview || 'Conversación'}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {formatFecha(conv.fechaInicio)}
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteConfirm(conv.id); }}
                    disabled={conversations.length === 1}
                    style={{ background: 'none', border: 'none', cursor: conversations.length === 1 ? 'not-allowed' : 'pointer', padding: '4px', borderRadius: '4px', color: conversations.length === 1 ? 'var(--border-color)' : 'var(--text-muted)', flexShrink: 0, display: 'flex', alignItems: 'center', opacity: conversations.length === 1 ? 0.4 : 1 }}
                    title={conversations.length === 1 ? 'No puedes eliminar la única conversación' : 'Eliminar conversación'}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Área principal del chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <div className="chat-page-header">
          <button className="btn-icon" onClick={handleBack}>
            <ArrowLeft size={20} />
          </button>
          <div className="chat-title">
            <Bot className="text-primary mt-1" size={28} />
            <div>
              <h2 className="text-xl m-0 leading-tight">Asistente Inteligente</h2>
              <span className="text-xs text-muted font-medium">Conectado a la base de datos centralizada</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', alignItems: 'center' }}>
            {!user && (
              <button className="btn-icon" onClick={handleNuevaConversacion} title="Nueva conversación">
                <Plus size={20} />
              </button>
            )}
            <button
              onClick={exportToPDF}
              disabled={messages.length === 0}
              title="Exportar como PDF"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-hover)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, cursor: messages.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)', opacity: messages.length === 0 ? 0.4 : 1 }}
            >
              <Download size={13} /> PDF
            </button>
            <button
              onClick={() => handleDownloadFormat('txt')}
              disabled={messages.length === 0}
              title="Exportar como TXT"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-hover)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, cursor: messages.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)', opacity: messages.length === 0 ? 0.4 : 1 }}
            >
              <Download size={13} /> TXT
            </button>
            <button
              onClick={() => handleDownloadFormat('json')}
              disabled={messages.length === 0}
              title="Exportar como JSON"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-hover)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, cursor: messages.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)', opacity: messages.length === 0 ? 0.4 : 1 }}
            >
              <Download size={13} /> JSON
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div className="chat-page-content bg-card border-x border-border">
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message-wrapper ${msg.role}`}>
                <div className={`message-avatar ${msg.role}`}>
                  {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: msg.role === 'user' ? '75%' : '85%' }}>
                  <div className={`message-bubble ${msg.role}`} style={{ maxWidth: '100%' }}>
                    {msg.role === 'assistant' ? <Markdown>{msg.text}</Markdown> : msg.text}
                  </div>
                  {msg.vehiculos && msg.vehiculos.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {msg.vehiculos.map(car => <ChatCarCard key={car.id} car={car} />)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message-wrapper assistant">
                <div className="message-avatar assistant"><Bot size={20} /></div>
                <div className="message-bubble assistant typing">
                  <Loader2 className="spinner text-primary" size={18} /> Procesando solicitud...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-page-input-area border-b border-border" onSubmit={handleSend}>
            <input
              type="text"
              className="input-field chat-input full-page-input"
              placeholder="Pregunta por un coche automático, que gaste poco y por menos de 20.000€..."
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              disabled={isTyping}
              autoFocus
            />
            <button type="submit" className="btn-primary send-btn" disabled={!inputMsg.trim() || isTyping}>
              <Send size={24} />
            </button>
          </form>
        </div>
      </div>

      {/* Modal salida usuarios anónimos */}
      {showExitModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '32px', textAlign: 'center' }}>
            <Bot size={40} className="text-primary" style={{ margin: '0 auto 16px' }} />
            <h2 className="text-xl font-bold mb-3">¿Quieres guardar esta conversación?</h2>
            <p className="text-muted mb-6" style={{ lineHeight: 1.6 }}>
              Crea una cuenta gratuita para guardar tu historial de conversaciones y acceder a ellas cuando quieras.
            </p>
            <div className="flex flex-col gap-3">
              <button className="btn-primary" onClick={() => { setShowExitModal(false); setLoginModalTab('register'); setIsLoginModalOpen(true); }}>
                Crear cuenta gratis
              </button>
              <button
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}
                onClick={() => { setShowExitModal(false); setLoginModalTab('login'); setIsLoginModalOpen(true); }}
              >
                Ya tengo cuenta
              </button>
              <button
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}
                onClick={() => { setShowExitModal(false); navigate(-1); }}
              >
                Salir de todas formas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmación de borrado */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ maxWidth: '380px', width: '100%', padding: '28px', textAlign: 'center' }}>
            <Trash2 size={36} style={{ margin: '0 auto 12px', color: 'var(--error)' }} />
            <h3 className="text-lg font-bold mb-2">¿Eliminar conversación?</h3>
            <p className="text-muted mb-6" style={{ fontSize: '0.9rem' }}>Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-center">
              <button
                style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-ui)', color: 'var(--text-muted)' }}
                onClick={() => setDeleteConfirm(null)}
              >
                Cancelar
              </button>
              <button
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'var(--error, #ef4444)', color: 'white', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 600 }}
                onClick={() => handleDelete(deleteConfirm)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatCarCard({ car }) {
  const imagen = car.imagenes?.find(i => i.esPrincipal)?.url || car.imagenes?.[0]?.url || null;
  const precio = car.precio ? Number(car.precio).toLocaleString('es-ES') + ' €' : 'Consultar';
  const combustible = car.combustibles?.[0]?.nombre || '';

  return (
    <Link
      to={`/inventario/${car.id}`}
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', textDecoration: 'none', transition: 'border-color 0.15s, box-shadow 0.15s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--primary-light)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {imagen ? (
        <img src={imagen} alt={`${car.marca} ${car.modelo}`} style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
      ) : (
        <div style={{ width: 64, height: 48, borderRadius: '8px', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Tag size={20} className="text-muted" />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {car.marca} {car.modelo} {car.version && <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>{car.version}</span>}
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700 }}>
            <Tag size={12} /> {precio}
          </span>
          {car.color && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <Palette size={12} /> {car.color}
            </span>
          )}
          {car.kilometros != null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <Gauge size={12} /> {car.kilometros.toLocaleString('es-ES')} km
            </span>
          )}
          {combustible && (
            <span style={{ fontSize: '0.75rem', padding: '1px 6px', borderRadius: '4px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>
              {combustible}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
