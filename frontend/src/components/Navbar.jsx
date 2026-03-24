import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CarFront, User, Settings, LogOut, Sun, Moon, LayoutDashboard } from 'lucide-react';

export default function Navbar({ theme, setTheme }) {
  const { user, logout, setIsLoginModalOpen } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/inventario' },
    { name: 'Servicios', path: '/', hash: 'servicios' },
    { name: 'Chat', path: '/chat' },
    { name: 'Contacto', path: '/', hash: 'contacto' },
  ];

  const handleHashNavigation = (e, link) => {
    e.preventDefault();
    
    const scrollToSection = () => {
      const element = document.getElementById(link.hash);
      if (element) {
        const navbarHeight = 80;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - navbarHeight,
          behavior: 'smooth'
        });
      }
    };

    if (location.pathname === '/') {
      // Already on home page, just scroll
      scrollToSection();
    } else {
      // Navigate to home first, then scroll after render
      navigate('/');
      setTimeout(scrollToSection, 150);
    }
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-content">
        <Link to="/" className="logo">
          <CarFront className="text-primary" size={28} />
          <span className="logo-text">Auto<span className="text-secondary">Elite</span></span>
        </Link>
        
        <div className="nav-links">
          {navLinks.map((link) => (
            link.hash ? (
              <a
                key={link.name}
                href={`#${link.hash}`}
                className="nav-link"
                onClick={(e) => handleHashNavigation(e, link)}
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.path}
                className={`nav-link ${location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path)) ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            )
          ))}
        </div>

        <div className="user-controls">
          <button className="btn-icon" onClick={toggleTheme} title="Cambiar Tema">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {user ? (
            <div className="user-menu">
              <span className="user-info" style={{ cursor: 'default' }}>
                <User size={18} />
                <span>{user.username}</span>
              </span>
              {user.role === 'admin' && (
                <Link to="/admin" className={`settings-link hover-primary ${location.pathname === '/admin' ? 'text-primary' : 'text-muted'}`} style={{ fontWeight: location.pathname === '/admin' ? 700 : undefined }}>
                  <LayoutDashboard size={16} /> Panel Admin
                </Link>
              )}
              <Link to="/perfil" className={`settings-link hover-primary ${location.pathname === '/perfil' ? 'text-primary' : 'text-muted'}`} style={{ fontWeight: location.pathname === '/perfil' ? 700 : undefined }}>
                 <Settings size={18} /> Ajustes
              </Link>
              <button onClick={logout} className="logout-link text-muted hover-danger">
                 <LogOut size={18} /> Salir
              </button>
            </div>
          ) : (
            <button className="btn-primary" onClick={() => setIsLoginModalOpen(true)}>
               Iniciar Sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
