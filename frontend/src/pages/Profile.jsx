import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { ArrowLeft, User, CreditCard, Lock, Edit2, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personales');

  return (
    <div className="page-container" style={{maxWidth: '900px'}}>
      
      {/* Header Profile */}
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
        {activeTab === 'personales' && <PersonalDataForm />}
        {activeTab === 'bancarios' && user?.role !== 'admin' && <BankDataForm />}
        {activeTab === 'seguridad' && <SecurityForm />}
      </div>
    </div>
  );
}

function PersonalDataForm() {
  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Información Personal</h2>
        <button className="flex items-center text-primary font-medium gap-2 text-sm">
          <Edit2 size={16} /> Editar
        </button>
      </div>
      
      <div className="grid-2col">
        <div className="form-group">
          <label className="label">Nombre</label>
          <input type="text" className="input-field" defaultValue="Juan" disabled/>
        </div>
        <div className="form-group">
          <label className="label">Apellidos</label>
          <input type="text" className="input-field" defaultValue="García Martínez" disabled/>
        </div>
        <div className="form-group">
          <label className="label">DNI/NIE</label>
          <input type="text" className="input-field" defaultValue="12345678A" disabled/>
        </div>
        <div className="form-group">
          <label className="label">Fecha de Nacimiento</label>
          <input type="text" className="input-field" defaultValue="15/05/1990" disabled/>
        </div>
        <div className="form-group">
          <label className="label">Email</label>
          <input type="email" className="input-field" defaultValue="juan.garcia@email.com" disabled/>
        </div>
        <div className="form-group">
          <label className="label">Teléfono</label>
          <input type="text" className="input-field" defaultValue="+34 612 345 678" disabled/>
        </div>
        <div className="form-group col-span-2">
          <label className="label">Dirección</label>
          <input type="text" className="input-field" defaultValue="Calle Mayor 123, 4º B" disabled/>
        </div>
        <div className="form-group">
          <label className="label">Ciudad</label>
          <input type="text" className="input-field" defaultValue="Madrid" disabled/>
        </div>
        <div className="form-group">
          <label className="label">Código Postal</label>
          <input type="text" className="input-field" defaultValue="28001" disabled/>
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

function SecurityForm() {
  return (
    <div className="animate-fade-in-up">
      <h2 className="text-xl font-bold mb-6">Seguridad y Contraseña</h2>
      
      <div className="alert-box warning mb-6">
        <Lock size={20} className="text-warning" />
        <span className="text-sm font-medium text-warning">Asegúrate de usar una contraseña segura que contenga letras mayúsculas, minúsculas, números y símbolos.</span>
      </div>

      <div className="flex flex-col gap-6 mb-10">
        <div className="form-group">
          <label className="label">Contraseña Actual</label>
          <input type="password" className="input-field" placeholder="Ingrese su contraseña actual" />
        </div>
        <div className="form-group">
          <label className="label">Nueva Contraseña</label>
          <input type="password" className="input-field" placeholder="Ingrese su nueva contraseña" />
        </div>
        <div className="form-group">
          <label className="label">Confirmar Nueva Contraseña</label>
          <input type="password" className="input-field" placeholder="Confirme su nueva contraseña" />
        </div>
        <div>
          <button className="btn-primary mt-2">
            <Lock size={16} /> Cambiar Contraseña
          </button>
        </div>
      </div>

      <h3 className="text-lg font-bold mb-4 border-t border-border pt-8">Sesiones Activas</h3>
      <div className="bg-hover p-4 rounded-xl flex justify-between items-center border border-border">
        <div>
          <p className="font-semibold text-sm">Navegador Actual</p>
          <p className="text-xs text-muted">Madrid, España • Última actividad: Ahora</p>
        </div>
        <span className="badge success">Activa</span>
      </div>
    </div>
  );
}
