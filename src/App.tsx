import React, { useState, useMemo, useEffect } from 'react';
import { PsicologoCard } from './components/PsicologoCard';
import { FiltrosBusquedaComponent } from './components/FiltrosBusqueda';
import { ModalAgendamiento } from './components/ModalAgendamiento';
import { SesionesAgendadas } from './components/SesionesAgendadas';
import { psicologos } from './data/psicologos';
import { Psicologo, FiltrosBusqueda, Sesion } from './types';
import './App.css';

const STORAGE_KEY = 'psiconnect-sesiones';

const cargarSesionesDeStorage = (): Sesion[] => {
  try {
    const sesionesGuardadas = localStorage.getItem(STORAGE_KEY);
    if (sesionesGuardadas) {
      return JSON.parse(sesionesGuardadas);
    }
  } catch (error) {
    console.error('Error al cargar sesiones desde localStorage:', error);
  }
  return [];
};

const guardarSesionesEnStorage = (sesiones: Sesion[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sesiones));
  } catch (error) {
    console.error('Error al guardar sesiones en localStorage:', error);
  }
};

function App() {
  const [psicologoSeleccionado, setPsicologoSeleccionado] = useState<Psicologo | null>(null);
  const [sesiones, setSesiones] = useState<Sesion[]>(() => cargarSesionesDeStorage());
  const [vistaActual, setVistaActual] = useState<'buscar' | 'sesiones'>('buscar');
  const [filtros, setFiltros] = useState<FiltrosBusqueda>({
    especialidad: 'Todas',
    precioMax: 150,
    disponibilidad: '',
    modalidad: ''
  });

  // Guardar sesiones en localStorage cada vez que cambien
  useEffect(() => {
    guardarSesionesEnStorage(sesiones);
  }, [sesiones]);

  const psicologosFiltrados = useMemo(() => {
    return psicologos.filter(psicologo => {
      const cumpleEspecialidad = filtros.especialidad === 'Todas' || 
        psicologo.especialidades.some(esp => esp.includes(filtros.especialidad));
      
      const cumplePrecio = psicologo.precio <= filtros.precioMax;
      
      const modalidadSeleccionada = filtros.modalidad as 'online' | 'presencial' | '';
      const cumpleModalidad = modalidadSeleccionada === '' || 
        psicologo.modalidades.includes(modalidadSeleccionada as 'online' | 'presencial');
      
      const cumpleDisponibilidad = !filtros.disponibilidad || 
        psicologo.disponibilidad.some(disp => {
          if (disp.fecha !== filtros.disponibilidad) return false;
          
          if (modalidadSeleccionada === '') return disp.horarios.length > 0;
          
          return disp.horarios.some(horario => 
            horario.modalidades.includes(modalidadSeleccionada as 'online' | 'presencial')
          );
        });

      return cumpleEspecialidad && cumplePrecio && cumpleModalidad && cumpleDisponibilidad;
    });
  }, [filtros]);

  const handleAgendar = (nuevaSesion: Omit<Sesion, 'id' | 'estado'>) => {
    const sesion: Sesion = {
      ...nuevaSesion,
      id: Date.now().toString(),
      estado: 'confirmada'
    };
    
    setSesiones(prev => [...prev, sesion]);
    alert('¡Sesión agendada exitosamente! 🎉\nTus datos han sido guardados automáticamente.');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-container">
            <div className="logo-wrapper">
              <img 
                src={`${process.env.PUBLIC_URL}/logo.svg`}
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
            <h1>PsiConnect</h1>
          </div>
          <p className="subtitle">
            Tu plataforma integral de bienestar mental
            <br />
            <em>Conecta con profesionales especializados y transforma tu vida</em>
          </p>
          
          <nav className="navegacion">
            <button 
              className={vistaActual === 'buscar' ? 'activo' : ''}
              onClick={() => setVistaActual('buscar')}
            >
              🔍 Buscar Especialistas
            </button>
            <button 
              className={vistaActual === 'sesiones' ? 'activo' : ''}
              onClick={() => setVistaActual('sesiones')}
            >
              📅 Mis Sesiones {sesiones.length > 0 && `(${sesiones.length})`}
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {vistaActual === 'buscar' && (
          <div className="busqueda-container">
            <aside className="sidebar">
              <FiltrosBusquedaComponent 
                filtros={filtros}
                onFiltrosChange={setFiltros}
              />
            </aside>

            <div className="contenido-principal">
              <div className="resultados-header">
                <h2>Profesionales Especializados</h2>
                <p>
                  {psicologosFiltrados.length} {psicologosFiltrados.length === 1 ? 'especialista encontrado' : 'especialistas encontrados'} 
                  {filtros.especialidad !== 'Todas' && ` en ${filtros.especialidad}`}
                </p>
              </div>

              <div className="psicologos-grid">
                {psicologosFiltrados.map(psicologo => (
                  <PsicologoCard
                    key={psicologo.id}
                    psicologo={psicologo}
                    onSeleccionar={setPsicologoSeleccionado}
                  />
                ))}
              </div>

              {psicologosFiltrados.length === 0 && (
                <div className="sin-resultados">
                  <h3>No se encontraron especialistas</h3>
                  <p>Intenta ajustar los filtros para encontrar más opciones</p>
                </div>
              )}
            </div>
          </div>
        )}

        {vistaActual === 'sesiones' && (
          <SesionesAgendadas sesiones={sesiones} psicologos={psicologos} />
        )}
      </main>

      {psicologoSeleccionado && (
        <ModalAgendamiento
          psicologo={psicologoSeleccionado}
          onCerrar={() => setPsicologoSeleccionado(null)}
          onAgendar={handleAgendar}
        />
      )}
    </div>
  );
}

export default App; 