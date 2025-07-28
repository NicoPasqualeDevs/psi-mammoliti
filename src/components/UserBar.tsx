import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const UserBar: React.FC = () => {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const { usuario, cerrarSesion } = useAuth();

  if (!usuario) return null;

  const manejarCerrarSesion = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      cerrarSesion();
    }
  };

  return (
    <div className="user-bar">
      <div className="user-bar-content">
        <div className="user-info">
          <div className="user-avatar">
            {usuario.email.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <span className="user-email">{usuario.email}</span>
            <span className="user-status">Sesión activa</span>
          </div>
        </div>

        <div className="user-actions">
          <button
            className="user-menu-toggle"
            onClick={() => setMostrarMenu(!mostrarMenu)}
          >
            ⚙️
          </button>
          
          {mostrarMenu && (
            <div className="user-menu">
              <button
                onClick={manejarCerrarSesion}
                className="menu-item logout"
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 