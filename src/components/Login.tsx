import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const { iniciarSesion } = useAuth();

  const validarEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Por favor ingresa tu email');
      return;
    }

    if (!validarEmail(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setCargando(true);
    setError('');

    try {
      iniciarSesion(email.trim().toLowerCase());
    } catch (error) {
      setError('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <h1>🧠 PsiConnect</h1>
          <h2>Bienvenido</h2>
          <p>Ingresa tu email para acceder a tu cuenta</p>
        </div>

        <form onSubmit={manejarSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              📧 Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="tu@correo.com"
              className={error ? 'error' : ''}
              disabled={cargando}
              required
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <button 
            type="submit" 
            className="btn-login"
            disabled={cargando || !email.trim()}
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-info">
          <div className="info-section">
            <h4>¿Eres nuevo aquí?</h4>
            <p>Simplemente ingresa tu email y podrás:</p>
            <ul>
              <li>✅ Buscar psicólogos especializados</li>
              <li>📅 Agendar sesiones online o presenciales</li>
              <li>📋 Ver tu historial de citas</li>
              <li>💬 Gestionar tus sesiones</li>
            </ul>
          </div>

          <div className="info-section">
            <h4>🔒 Tu privacidad es importante</h4>
            <p>Solo usamos tu email para identificar tus sesiones. No compartimos tu información con terceros.</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 