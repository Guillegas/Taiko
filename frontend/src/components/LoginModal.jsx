import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, X, User, Lock } from 'lucide-react';
import '../App.css'; 

export default function LoginModal() {
  const { login, isLoginModalOpen, setIsLoginModalOpen } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (!success) {
      setError('Credenciales incorrectas. Comprueba tu usuario y contraseña.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="login-modal card animate-fade-in-up">
        <button className="close-btn" onClick={() => setIsLoginModalOpen(false)}>
          <X size={20} />
        </button>
        
        <div className="login-header">
          <div className="login-icon">
             <LogIn size={24} className="text-primary" />
          </div>
          <h2>Iniciar Sesión</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="label">Usuario</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                className="input-field pl-10" 
                placeholder="Ingrese su usuario"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group mt-4">
            <label className="label">Contraseña</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                className="input-field pl-10" 
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="error-text mt-2">{error}</p>}

          <button type="submit" className="btn-primary w-full mt-6">
            Iniciar Sesión
          </button>
        </form>

      </div>
    </div>
  );
}
