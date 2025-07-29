import React, { useState, useEffect, useMemo } from 'react';
import { Psicologo, Sesion, SesionConPsicologo, SesionConPsicologoRequerido, Modalidad } from '../types';
import { useUserSesiones } from '../hooks/useUserSesiones';
import { useSesionActions } from '../hooks/useSesionActions';
import { ModalReprogramar } from './ModalReprogramar';
import './SesionesAgendadas.css';
import './ModalReprogramar.css';

interface SesionesAgendadasProps {
  psicologos: Psicologo[];
}

// Utilidades para fechas y tiempo
const formatearFecha = (fecha: string): string => {
  // Agregar T12:00:00 para evitar problemas de zona horaria
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatearFechaCorta = (fecha: string): string => {
  // Agregar T12:00:00 para evitar problemas de zona horaria
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  });
};

const obtenerTiempoRelativo = (fecha: string, hora: string): string => {
  const ahora = new Date();
  const fechaSesion = new Date(`${fecha} ${hora}`);
  const diferencia = fechaSesion.getTime() - ahora.getTime();
  
  if (diferencia < 0) {
    return 'Pasada';
  }
  
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
  
  if (dias > 0) {
    return `En ${dias} día${dias !== 1 ? 's' : ''}`;
  } else if (horas > 0) {
    return `En ${horas} hora${horas !== 1 ? 's' : ''}`;
  } else if (minutos > 0) {
    return `En ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
  } else {
    return 'Ahora';
  }
};

const getModalidadIcon = (modalidad: string): string => {
  return modalidad === 'online' ? '💻' : '🏢';
};

const getEstadoIcon = (estado: string): string => {
  switch (estado) {
    case 'confirmada': return '✅';
    case 'cancelada': return '❌';
    case 'completada': return '✨';
    default: return '📅';
  }
};

export const SesionesAgendadas: React.FC<SesionesAgendadasProps> = ({ psicologos }) => {
  const { sesiones, cargando, recargando, error, refrescar } = useUserSesiones();
  
  // Estados para filtros
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [filtroModalidad, setFiltroModalidad] = useState<Modalidad | ''>('');
  const [ordenamiento, setOrdenamiento] = useState<'fecha' | 'psicologo'>('fecha');
  const [vistaActual, setVistaActual] = useState<'proximas' | 'historial'>('proximas');
  
  // Estados para modales y acciones
  const [sesionReprogramar, setSesionReprogramar] = useState<SesionConPsicologoRequerido | null>(null);
  const [mostrarModalReprogramar, setMostrarModalReprogramar] = useState(false);
  
  // Hook para acciones de sesiones
  const { cancelarSesion, cancelando, error: errorAcciones, limpiarError } = useSesionActions();

  // Procesar y filtrar sesiones
  const sesionesProcessadas = useMemo(() => {
    const ahora = new Date();
    
    const sesionesConInfo = sesiones.map(sesion => {
      const psicologo = psicologos.find(p => p.id === sesion.psicologoId);
      const fechaSesion = new Date(`${sesion.fecha} ${sesion.hora}`);
      const esPasada = fechaSesion < ahora;
      
      return {
        ...sesion,
        psicologo,
        fechaSesion,
        esPasada,
        tiempoRelativo: obtenerTiempoRelativo(sesion.fecha, sesion.hora)
      };
    });

    // Filtrar por estado
    let sesionesFilter = sesionesConInfo;
    if (filtroEstado !== 'todas') {
      sesionesFilter = sesionesConInfo.filter(s => s.estado === filtroEstado);
    }

    // Filtrar por modalidad
    if (filtroModalidad) {
      sesionesFilter = sesionesFilter.filter(s => s.modalidad === filtroModalidad);
    }

    // Separar próximas y pasadas
    // IMPORTANTE: Las próximas sesiones NO incluyen las canceladas (se ocultan del buscador)
    // Solo mostramos sesiones confirmadas en próximas sesiones
    const proximas = sesionesFilter.filter(s => !s.esPasada && s.estado === 'confirmada');
    
    // Las pasadas incluyen tanto sesiones completadas como canceladas
    // Las sesiones canceladas aparecen siempre en el historial, independientemente de su fecha
    const pasadas = sesionesFilter.filter(s => s.esPasada || s.estado === 'cancelada');

    // Ordenar
    const sortFunction = (a: any, b: any) => {
      if (ordenamiento === 'fecha') {
        return a.fechaSesion.getTime() - b.fechaSesion.getTime();
      } else {
        return (a.psicologo?.nombre || '').localeCompare(b.psicologo?.nombre || '');
      }
    };

    proximas.sort(sortFunction);
    pasadas.sort((a, b) => b.fechaSesion.getTime() - a.fechaSesion.getTime()); // Pasadas más recientes primero

    return { proximas, pasadas };
  }, [sesiones, psicologos, filtroEstado, filtroModalidad, ordenamiento]);

  // Obtener próxima sesión
  const proximaSesion = sesionesProcessadas.proximas[0];

  // Handlers para acciones
  const handleUnirseOnline = (sesion: SesionConPsicologo) => {
    // Aquí implementarías la lógica para unirse a una sesión online
    // Por ejemplo, abrir una ventana con el enlace de la videollamada
    const enlaceVideoLlamada = `https://meet.psiconnect.com/session/${sesion.id}`;
    window.open(enlaceVideoLlamada, '_blank', 'width=1200,height=800');
  };

  const handleCancelar = async (sesion: SesionConPsicologo) => {
    const confirmar = window.confirm(
      `¿Estás seguro de que quieres cancelar tu sesión con ${sesion.psicologo?.nombre} ${sesion.psicologo?.apellido}?\n\n` +
      `Fecha: ${formatearFecha(sesion.fecha)}\n` +
      `Hora: ${sesion.hora}\n\n` +
      `Esta acción no se puede deshacer.`
    );
    
    if (!confirmar) return;

    limpiarError();
    const exito = await cancelarSesion(sesion.id);
    
    if (exito) {
      await refrescar(); // Actualizar la lista de sesiones
    }
  };

  const handleReprogramar = (sesion: SesionConPsicologo) => {
    if (!sesion.psicologo) {
      console.error('No se puede reprogramar: faltan datos del psicólogo');
      return;
    }
    setSesionReprogramar(sesion as SesionConPsicologoRequerido);
    setMostrarModalReprogramar(true);
  };

  const handleCerrarModalReprogramar = () => {
    setMostrarModalReprogramar(false);
    setSesionReprogramar(null);
    limpiarError();
  };

  const handleExitoReprogramar = async () => {
    await refrescar(); // Actualizar la lista de sesiones
  };

  // Estados de carga y error
  if (cargando) {
    return (
      <div className="sesiones-agendadas-mejoradas">
        <div className="loading-moderna">
          <div className="loading-spinner-moderna"></div>
          <p>Cargando tus sesiones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sesiones-agendadas-mejoradas">
        <div className="error-moderna">
          <h3>❌ Error al cargar sesiones</h3>
          <p>{error}</p>
          <button onClick={refrescar} className="btn-retry" disabled={recargando}>
            {recargando ? 'Reintentando...' : 'Reintentar'}
          </button>
        </div>
      </div>
    );
  }

  // Estado vacío
  if (sesiones.length === 0) {
    return (
      <div className="sesiones-agendadas-mejoradas">
        <div className="estado-vacio">
          <div className="estado-vacio-icon">📅</div>
          <h3>No tienes sesiones agendadas</h3>
          <p>Cuando agendes sesiones con psicólogos, aparecerán aquí</p>
          <button className="btn-accion-vacio" onClick={() => window.history.back()}>
            Buscar Psicólogos
          </button>
        </div>
      </div>
    );
  }

  const sesionesActuales = vistaActual === 'proximas' ? sesionesProcessadas.proximas : sesionesProcessadas.pasadas;

  return (
    <div className="sesiones-agendadas-mejoradas">
      {/* Header Principal */}
      <div className="sesiones-main-header">
        <div className="sesiones-title">
          <span className="sesiones-icon">📅</span>
          <h2>Mis Sesiones</h2>
        </div>
        <div className="sesiones-controls">
          <div className="sesiones-stats">
            <div className="stat-item">
              <span>🔜</span>
              <span>{sesionesProcessadas.proximas.length} próximas</span>
            </div>
            <div className="stat-item">
              <span>📚</span>
              <span>{sesionesProcessadas.pasadas.filter(s => s.estado !== 'cancelada').length} completadas</span>
            </div>
            <div className="stat-item">
              <span>❌</span>
              <span>{sesionesProcessadas.pasadas.filter(s => s.estado === 'cancelada').length} canceladas</span>
            </div>
          </div>
          <button 
            onClick={refrescar} 
            className="btn-refresh-modern"
            disabled={recargando}
          >
            {recargando ? '⏳' : '🔄'}
            {recargando ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* Próxima Sesión Destacada */}
      {proximaSesion && vistaActual === 'proximas' && (
        <div className="proximas-sesiones">
          <div className="section-header">
            <span className="section-icon">🚀</span>
            <h3>Próxima Sesión</h3>
          </div>
          
          <div className="proxima-sesion-destacada">
            <div className="proxima-info">
              <div className="proxima-countdown">
                {proximaSesion.tiempoRelativo}
              </div>
              
              <div className="proxima-detalles">
                <div className="proxima-datos">
                  <h4>{proximaSesion.psicologo?.nombre} {proximaSesion.psicologo?.apellido}</h4>
                  <div className="proxima-meta">
                    <div className="meta-item">
                      <span>📅</span>
                      <span>{formatearFecha(proximaSesion.fecha)}</span>
                    </div>
                    <div className="meta-item">
                      <span>🕒</span>
                      <span>{proximaSesion.hora}</span>
                    </div>
                    <div className="meta-item">
                      <span>{getModalidadIcon(proximaSesion.modalidad)}</span>
                      <span>{proximaSesion.modalidad}</span>
                    </div>
                    <div className="meta-item">
                      <span>🎯</span>
                      <span>{proximaSesion.especialidad}</span>
                    </div>
                  </div>
                </div>
                
                <div className="proxima-acciones">
                  {proximaSesion.modalidad === 'online' && (
                    <button 
                      className="btn-accion-proxima primary"
                      onClick={() => handleUnirseOnline(proximaSesion)}
                      disabled={cancelando}
                    >
                      🚀 Unirse a Sesión
                    </button>
                  )}
                  <button 
                    className="btn-accion-proxima"
                    onClick={() => handleReprogramar(proximaSesion)}
                    disabled={cancelando}
                  >
                    📅 Reprogramar
                  </button>
                  <button 
                    className="btn-accion-proxima"
                    onClick={() => handleCancelar(proximaSesion)}
                    disabled={cancelando}
                  >
                    {cancelando ? '⏳ Cancelando...' : '❌ Cancelar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navegación entre Próximas e Historial */}
      <div className="sesiones-filters">
        <div className="filter-group">
          <label>Vista</label>
          <select 
            className="filter-select"
            value={vistaActual}
            onChange={(e) => setVistaActual(e.target.value as 'proximas' | 'historial')}
          >
            <option value="proximas">🔜 Próximas ({sesionesProcessadas.proximas.length})</option>
            <option value="historial">📚 Historial ({sesionesProcessadas.pasadas.length})</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Estado</label>
          <select 
            className="filter-select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todas">Todas</option>
            <option value="confirmada">✅ Confirmadas</option>
            <option value="cancelada">❌ Canceladas</option>
            <option value="completada">✨ Completadas</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Modalidad</label>
          <select 
            className="filter-select"
            value={filtroModalidad}
            onChange={(e) => setFiltroModalidad(e.target.value as Modalidad | '')}
          >
            <option value="">Todas</option>
            <option value="online">💻 Online</option>
            <option value="presencial">🏢 Presencial</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Ordenar por</label>
          <select 
            className="filter-select"
            value={ordenamiento}
            onChange={(e) => setOrdenamiento(e.target.value as 'fecha' | 'psicologo')}
          >
            <option value="fecha">📅 Fecha</option>
            <option value="psicologo">👤 Psicólogo</option>
          </select>
        </div>
      </div>

      {/* Mensaje informativo para historial con sesiones canceladas */}
      {vistaActual === 'historial' && sesionesActuales.some(s => s.estado === 'cancelada') && (
        <div className="info-sesiones-canceladas">
          <div className="info-icon">ℹ️</div>
          <p>
            <strong>Nota:</strong> Las sesiones canceladas aparecen en el historial para mantener un registro completo. 
            Solo las sesiones confirmadas se muestran en próximas sesiones.
          </p>
        </div>
      )}

      {/* Lista de Sesiones */}
      {sesionesActuales.length === 0 ? (
        <div className="estado-vacio">
          <div className="estado-vacio-icon">
            {vistaActual === 'proximas' ? '🔜' : '📚'}
          </div>
          <h3>
            {vistaActual === 'proximas' 
              ? 'No tienes próximas sesiones activas' 
              : 'No hay sesiones en el historial'
            }
          </h3>
          <p>
            {vistaActual === 'proximas' 
              ? 'Agenda una sesión con un psicólogo para comenzar. Solo las sesiones confirmadas se muestran aquí.' 
              : 'Las sesiones completadas y canceladas aparecerán aquí'
            }
          </p>
        </div>
      ) : (
        <div className="sesiones-grid">
          {sesionesActuales.map(sesion => (
            <div key={sesion.id} className={`sesion-card-moderna ${sesion.estado === 'cancelada' ? 'sesion-cancelada' : ''}`}>
              <div className={`sesion-status-bar status-${sesion.estado}`}></div>
              
              <div className="sesion-header-moderna">
                <div className="psicologo-info-moderna">
                  <img 
                    src={sesion.psicologo?.imagen || '/default-avatar.png'} 
                    alt={sesion.psicologo?.nombre}
                    className="psicologo-avatar"
                  />
                  <div className="psicologo-datos">
                    <h4>{sesion.psicologo?.nombre} {sesion.psicologo?.apellido}</h4>
                    <div className="psicologo-rating">
                      <span>⭐</span>
                      <span>{sesion.psicologo?.rating || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className={`estado-badge ${sesion.estado}`}>
                  {getEstadoIcon(sesion.estado)} {sesion.estado}
                </div>
              </div>
              
              <div className="sesion-detalles-moderna">
                <div className="detalle-item">
                  <span className="detalle-icon">📅</span>
                  <div className="detalle-content">
                    <div className="detalle-label">Fecha</div>
                    <div className="detalle-value">{formatearFechaCorta(sesion.fecha)}</div>
                  </div>
                </div>
                
                <div className="detalle-item">
                  <span className="detalle-icon">🕒</span>
                  <div className="detalle-content">
                    <div className="detalle-label">Hora</div>
                    <div className="detalle-value">{sesion.hora}</div>
                  </div>
                </div>
                
                <div className="detalle-item">
                  <span className="detalle-icon">{getModalidadIcon(sesion.modalidad)}</span>
                  <div className="detalle-content">
                    <div className="detalle-label">Modalidad</div>
                    <div className="detalle-value">{sesion.modalidad}</div>
                  </div>
                </div>
                
                <div className="detalle-item">
                  <span className="detalle-icon">🎯</span>
                  <div className="detalle-content">
                    <div className="detalle-label">Especialidad</div>
                    <div className="detalle-value">{sesion.especialidad}</div>
                  </div>
                </div>
                
                <div className="detalle-item">
                  <span className="detalle-icon">💰</span>
                  <div className="detalle-content">
                    <div className="detalle-label">Precio</div>
                    <div className="detalle-value">${sesion.psicologo?.precio}</div>
                  </div>
                </div>
                
                                  <div className="detalle-item">
                    <span className="detalle-icon">⏰</span>
                    <div className="detalle-content">
                      <div className="detalle-label">Estado</div>
                      <div className="detalle-value">
                        {sesion.estado === 'cancelada' ? 'Cancelada' : sesion.tiempoRelativo}
                      </div>
                    </div>
                  </div>
              </div>
              
              <div className="sesion-acciones">
                {!sesion.esPasada && sesion.modalidad === 'online' && sesion.estado === 'confirmada' && (
                  <button 
                    className="btn-accion primary"
                    onClick={() => handleUnirseOnline(sesion)}
                  >
                    🚀 Unirse
                  </button>
                )}
                
                {!sesion.esPasada && sesion.estado === 'confirmada' && (
                  <>
                    <button 
                      className="btn-accion secondary"
                      onClick={() => handleReprogramar(sesion)}
                      disabled={cancelando}
                    >
                      📅 Reprogramar
                    </button>
                    <button 
                      className="btn-accion danger"
                      onClick={() => handleCancelar(sesion)}
                      disabled={cancelando}
                    >
                      {cancelando ? '⏳ Cancelando...' : '❌ Cancelar'}
                    </button>
                  </>
                )}
                
                {sesion.esPasada && (
                  <button className="btn-accion secondary">
                    📝 Dar Reseña
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Reprogramar */}
      {mostrarModalReprogramar && sesionReprogramar && (
        <ModalReprogramar
          sesion={sesionReprogramar}
          onCerrar={handleCerrarModalReprogramar}
          onExito={handleExitoReprogramar}
        />
      )}

      {/* Mostrar errores de acciones */}
      {errorAcciones && (
        <div className="error-acciones-sesiones">
          <p>❌ {errorAcciones}</p>
          <button onClick={limpiarError} className="btn-cerrar-error">×</button>
        </div>
      )}
    </div>
  );
}; 