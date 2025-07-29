import React, { useState, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { useDatabase } from './hooks/useDatabase';
import { useUserSesiones } from './hooks/useUserSesiones';
import { FiltrosBusquedaComponent } from './components/FiltrosBusqueda';
import { PsicologoCard } from './components/PsicologoCard';
import { ModalAgendamiento } from './components/ModalAgendamiento';
import { SesionesAgendadas } from './components/SesionesAgendadas';
import { Admin } from './components/Admin';
import { Login } from './components/Login';
import { UserBar } from './components/UserBar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FiltrosBusqueda, Psicologo } from './types';

// Componente principal de la aplicación pública
const MainApp: React.FC = () => {
  const { estaAutenticado } = useAuth();
  const {
    psicologos,
    loading,
    recargando,
    error,
    initialized,
    filtrarPsicologos,
    limpiarError
  } = useDatabase();

  // Hook para obtener solo las sesiones del usuario actual
  const { sesiones: sesionesUsuario, refrescar: refrescarSesiones } = useUserSesiones();

  // Filtrar sesiones para el contador - solo sesiones confirmadas (no canceladas)
  const sesionesActivasUsuario = useMemo(() => {
    return sesionesUsuario.filter(sesion => sesion.estado !== 'cancelada');
  }, [sesionesUsuario]);

  const [vistaActual, setVistaActual] = useState<'busqueda' | 'sesiones'>('busqueda');
  const [psicologoSeleccionado, setPsicologoSeleccionado] = useState<Psicologo | null>(null);
  const [horarioPreseleccionado, setHorarioPreseleccionado] = useState<{
    fecha: string;
    hora: string;
    modalidades: string[];
  } | null>(null);
  const [filtros, setFiltros] = useState<FiltrosBusqueda>({
    especialidad: '',
    precioMax: 200,
    disponibilidad: '',
    modalidad: ''
  });

  const psicologosFiltrados = useMemo(() => {
    // Solo ocultar durante carga inicial, no durante recargas
    if (!initialized) return [];
    
    return filtrarPsicologos(
      filtros.especialidad,
      filtros.precioMax,
      filtros.modalidad
    );
  }, [filtros, filtrarPsicologos, initialized]);

  // Mostrar login si no está autenticado
  if (!estaAutenticado) {
    return <Login />;
  }

  const handleSesionCreada = async () => {
    // Refrescar las sesiones del usuario para mostrar la nueva sesión
    await refrescarSesiones();
    setPsicologoSeleccionado(null);
    setHorarioPreseleccionado(null);
    setVistaActual('sesiones');
  };

  const handleSeleccionarPsicologo = (psicologo: Psicologo) => {
    setPsicologoSeleccionado(psicologo);
    setHorarioPreseleccionado(null); // Limpiar horario preseleccionado al ver todos los horarios
  };

  const handleSeleccionarHorario = (psicologo: Psicologo, fecha: string, hora: string, modalidades: string[]) => {
    setPsicologoSeleccionado(psicologo);
    setHorarioPreseleccionado({ fecha, hora, modalidades });
  };

  const handleCerrarModal = () => {
    setPsicologoSeleccionado(null);
    setHorarioPreseleccionado(null);
  };

  const handleFiltrosChange = (nuevosFiltros: FiltrosBusqueda) => {
    setFiltros(nuevosFiltros);
  };

  // Funciones para manejar la navegación
  const irABusqueda = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setVistaActual('busqueda');
  };

  const irASesiones = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setVistaActual('sesiones');
  };

  if (loading && !initialized) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Inicializando base de datos...</p>
        <small>Esto puede tomar unos segundos la primera vez</small>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error en la base de datos</h2>
        <p>{error}</p>
        <button onClick={limpiarError} className="btn-agendar">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      <UserBar />
      
      <header className="app-header">
        <div className="header-content">
          <div className="logo-container">
            <div className="logo-wrapper">
              <img 
                src="/logo.svg" 
                alt="PsiConnect Logo" 
                className="logo"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="logo-fallback" style={{ display: 'none' }}>
                🧠
              </div>
            </div>
          </div>
          <div>
            <h1>PsiConnect</h1>
            <p className="subtitle">Encuentra tu psicólogo ideal y agenda tu cita</p>
          </div>
        </div>
        
        <nav className="navegacion">
          <button 
            className={vistaActual === 'busqueda' ? 'activo' : ''}
            onClick={irABusqueda}
            type="button"
            style={{ 
              cursor: 'pointer', 
              pointerEvents: 'auto', 
              zIndex: 20,
              position: 'relative',
              userSelect: 'none'
            }}
          >
            <span className="nav-icon">🔍</span>
            <span className="nav-text">Buscar Psicólogos</span>
          </button>
          <button 
            className={vistaActual === 'sesiones' ? 'activo' : ''}
            onClick={irASesiones}
            type="button"
            style={{ 
              cursor: 'pointer', 
              pointerEvents: 'auto', 
              zIndex: 20,
              position: 'relative',
              userSelect: 'none'
            }}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-text">Mis Sesiones</span>
            {sesionesActivasUsuario.length > 0 && (
              <span className="nav-badge">{sesionesActivasUsuario.length}</span>
            )}
          </button>
        </nav>
      </header>

      {/* Indicador sutil de recarga */}
      {recargando && (
        <div className="recarga-indicator">
          <span>🔄 Actualizando datos...</span>
        </div>
      )}

      <main className="app-main">
        {vistaActual === 'busqueda' ? (
          <div className="busqueda-container">
            <aside className="sidebar">
              <FiltrosBusquedaComponent 
                filtros={filtros}
                onFiltrosChange={handleFiltrosChange}
              />
            </aside>

            <section className="contenido-principal">
              <div className="resultados-header">
                <h2>Psicólogos Disponibles</h2>
                <p>
                  {psicologosFiltrados.length} psicólogos encontrados
                  {filtros.especialidad && ` en ${filtros.especialidad}`}
                </p>
              </div>

              {psicologosFiltrados.length === 0 ? (
                <div className="sin-resultados">
                  <h3>No se encontraron psicólogos</h3>
                  <p>Intenta ajustar los filtros de búsqueda</p>
                </div>
              ) : (
                <div className="psicologos-grid fade-in-container">
                  {psicologosFiltrados.map((psicologo, index) => (
                    <PsicologoCard
                      key={psicologo.id}
                      psicologo={psicologo}
                      onSeleccionar={handleSeleccionarPsicologo}
                      onSeleccionarHorario={handleSeleccionarHorario}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <SesionesAgendadas 
            psicologos={psicologos}
          />
        )}
      </main>

      {psicologoSeleccionado && (
        <ModalAgendamiento
          psicologo={psicologoSeleccionado}
          onCerrar={handleCerrarModal}
          onSesionCreada={handleSesionCreada}
          horarioPreseleccionado={horarioPreseleccionado}
        />
      )}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App; 