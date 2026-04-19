import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, X, User, Lock, UserPlus, Mail, Phone } from 'lucide-react';
import '../App.css';

export default function LoginModal() {
  const { login, register, isLoginModalOpen, setIsLoginModalOpen, loginModalTab } = useAuth();
  const [tab, setTab] = useState(loginModalTab || 'login');

  useEffect(() => { setTab(loginModalTab || 'login'); }, [loginModalTab, isLoginModalOpen]);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regError, setRegError] = useState('');

  if (!isLoginModalOpen) return null;

  const handleClose = () => {
    setIsLoginModalOpen(false);
    setLoginError('');
    setRegError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const success = await login(loginEmail, loginPassword);
    if (!success) setLoginError('Credenciales incorrectas. Comprueba tu usuario y contraseña.');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    if (!regTelefono.trim()) return setRegError('El teléfono es obligatorio.');
    if (regPassword.length < 8) return setRegError('La contraseña debe tener al menos 8 caracteres.');
    if (regPassword !== regConfirm) return setRegError('Las contraseñas no coinciden.');
    const result = await register(regNombre, regEmail, regPassword, regTelefono);
    if (!result.success) setRegError(result.error || 'Error al crear la cuenta.');
  };

  return (
    <div className="modal-overlay">
      <div className="login-modal card animate-fade-in-up">
        <button className="close-btn" onClick={handleClose}>
          <X size={20} />
        </button>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <button
            onClick={() => setTab('login')}
            style={{ flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: tab === 'login' ? 700 : 400, color: tab === 'login' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: tab === 'login' ? '2px solid var(--primary)' : '2px solid transparent', transition: 'all 0.15s' }}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setTab('register')}
            style={{ flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: tab === 'register' ? 700 : 400, color: tab === 'register' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: tab === 'register' ? '2px solid var(--primary)' : '2px solid transparent', transition: 'all 0.15s' }}
          >
            Crear cuenta
          </button>
        </div>

        {tab === 'login' ? (
          <>
            <div className="login-header">
              <div className="login-icon"><LogIn size={24} className="text-primary" /></div>
              <h2>Iniciar Sesión</h2>
            </div>
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label className="label">Email</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input type="email" className="input-field pl-10" placeholder="tu@email.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                </div>
              </div>
              <div className="form-group mt-4">
                <label className="label">Contraseña</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input type="password" className="input-field pl-10" placeholder="Tu contraseña" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                </div>
              </div>
              {loginError && <p className="error-text mt-2">{loginError}</p>}
              <button type="submit" className="btn-primary w-full mt-6">Iniciar Sesión</button>
            </form>
          </>
        ) : (
          <>
            <div className="login-header">
              <div className="login-icon"><UserPlus size={24} className="text-primary" /></div>
              <h2>Crear Cuenta</h2>
            </div>
            <form onSubmit={handleRegister} className="login-form">
              <div className="form-group">
                <label className="label">Nombre</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input type="text" className="input-field pl-10" placeholder="Tu nombre" value={regNombre} onChange={e => setRegNombre(e.target.value)} required />
                </div>
              </div>
              <div className="form-group mt-4">
                <label className="label">Email</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input type="email" className="input-field pl-10" placeholder="tu@email.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                </div>
              </div>
              <div className="form-group mt-4">
                <label className="label">Teléfono</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input type="tel" className="input-field pl-10" placeholder="+34 600 000 000" value={regTelefono} onChange={e => setRegTelefono(e.target.value)} required />
                </div>
              </div>
              <div className="form-group mt-4">
                <label className="label">Contraseña</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input type="password" className="input-field pl-10" placeholder="Mínimo 8 caracteres" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                </div>
              </div>
              <div className="form-group mt-4">
                <label className="label">Confirmar contraseña</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input type="password" className="input-field pl-10" placeholder="Repite la contraseña" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} required />
                </div>
              </div>
              {regError && <p className="error-text mt-2">{regError}</p>}
              <button type="submit" className="btn-primary w-full mt-6">Crear cuenta</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
