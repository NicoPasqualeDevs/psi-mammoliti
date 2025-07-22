import React, { useState, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { useDatabase } from './hooks/useDatabase';
import { FiltrosBusquedaComponent } from './components/FiltrosBusqueda';
import { PsicologoCard } from './components/PsicologoCard';
import { ModalAgendamiento } from './components/ModalAgendamiento';
import { SesionesAgendadas } from './components/SesionesAgendadas';
import { Admin } from './components/Admin';
import { Psicologo, FiltrosBusqueda, Sesion } from './types';

// Componente principal de la aplicación pública
const MainApp: React.FC = () => {
  const {
    psicologos,
    sesiones,
    loading,
    error,
    initialized,
    insertarSesion,
    filtrarPsicologos,
    limpiarError
  } = useDatabase();

  const [vistaActual, setVistaActual] = useState<'busqueda' | 'sesiones'>('busqueda');
  const [psicologoSeleccionado, setPsicologoSeleccionado] = useState<Psicologo | null>(null);
  const [filtros, setFiltros] = useState<FiltrosBusqueda>({
    especialidad: '',
    precioMax: 200,
    disponibilidad: '',
    modalidad: ''
  });

  const psicologosFiltrados = useMemo(() => {
    if (!initialized || loading) return [];
    
    return filtrarPsicologos(
      filtros.especialidad,
      filtros.precioMax,
      filtros.modalidad
    );
  }, [filtros, filtrarPsicologos, initialized, loading]);

  const handleAgendar = async (nuevaSesion: Omit<Sesion, 'id' | 'estado'>) => {
    const sesion: Sesion = {
      ...nuevaSesion,
      id: Date.now().toString(),
      estado: 'pendiente'
    };

    const exito = await insertarSesion(sesion);
    
    if (exito) {
      setPsicologoSeleccionado(null);
      setVistaActual('sesiones');
    }
  };

  const handleSeleccionarPsicologo = (psicologo: Psicologo) => {
    setPsicologoSeleccionado(psicologo);
  };

  const handleCerrarModal = () => {
    setPsicologoSeleccionado(null);
  };

  const handleFiltrosChange = (nuevosFiltros: FiltrosBusqueda) => {
    setFiltros(nuevosFiltros);
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
            onClick={() => setVistaActual('busqueda')}
          >
            Buscar Psicólogos
          </button>
          <button 
            className={vistaActual === 'sesiones' ? 'activo' : ''}
            onClick={() => setVistaActual('sesiones')}
          >
            Mis Sesiones ({sesiones.length})
          </button>
        </nav>
      </header>

      <main className="app-main">
        {vistaActual === 'busqueda' && (
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
                <div className="psicologos-grid">
                  {psicologosFiltrados.map((psicologo) => (
                    <PsicologoCard
                      key={psicologo.id}
                      psicologo={psicologo}
                      onSeleccionar={handleSeleccionarPsicologo}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {vistaActual === 'sesiones' && (
          <SesionesAgendadas 
            sesiones={sesiones}
            psicologos={psicologos}
          />
        )}
      </main>

      {psicologoSeleccionado && (
        <ModalAgendamiento
          psicologo={psicologoSeleccionado}
          onCerrar={handleCerrarModal}
          onAgendar={handleAgendar}
        />
      )}
    </>
  );
};

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App; 