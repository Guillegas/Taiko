import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:8080/api';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [convId, setConvId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const initChat = async () => {
      try {
        const res = await fetch(`${API_URL}/chat/start`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setConvId(data.id);
          setMessages([{ role: 'assistant', text: '¡Hola! Soy el asistente virtual especialista de AutoElite. Estoy conectado a nuestro inventario en tiempo real. ¿En qué puedo ayudarte hoy para encontrar tu coche ideal?' }]);
        }
      } catch (e) {
        console.error("Error starting chat", e);
        setMessages([{ role: 'assistant', text: 'Bienvenido a AutoElite. Actualmente tengo algunos problemas de conexión con el servidor 🥺.' }]);
      }
    };
    initChat();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !convId) return;

    const userText = inputMsg.trim();
    setInputMsg('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/chat/${convId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: userText })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', text: data.respuesta }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: 'Lo siento, ha ocurrido un error al procesar tu solicitud.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error de conexión con el servidor.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-page animate-fade-in-up">
      <div className="chat-page-header">
        <Link to="/" className="btn-icon">
          <ArrowLeft size={20} />
        </Link>
        <div className="chat-title">
          <Bot className="text-primary mt-1" size={28} />
          <div>
            <h2 className="text-xl m-0 leading-tight">Asistente Inteligente</h2>
            <span className="text-xs text-muted font-medium">Conectado a la base de datos centralizada</span>
          </div>
        </div>
      </div>

      <div className="chat-page-content bg-card border-x border-border">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message-wrapper ${msg.role}`}>
              <div className={`message-avatar ${msg.role}`}>
                {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className={`message-bubble ${msg.role}`}>
                {msg.text}
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
  );
}
