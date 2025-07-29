import React, { useState, useEffect } from 'react';
import { useHorariosReales } from '../hooks/useHorariosReales';
import { useSesionActions } from '../hooks/useSesionActions';
import { CalendarioDisponibilidad } from './CalendarioDisponibilidad';
import { SesionConPsicologoRequerido } from '../types';
import './ModalReprogramar.css';

interface ModalReprogramarProps {
  sesion: SesionConPsicologoRequerido;
  onCerrar: () => void;
  onExito: () => void;
}

export const ModalReprogramar: React.FC<ModalReprogramarProps> = ({ 
  sesion, 
  onCerrar, 
  onExito 
}) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>('');
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const { disponibilidad, cargando: cargandoHorarios } = useHorariosReales({
    psicologoId: sesion.psicologoId,
    habilitado: true
  });

  const { reprogramarSesion, reprogramando, error, limpiarError } = useSesionActions();

  // Limpiar error cuando se abre el modal
  useEffect(() => {
    limpiarError();
  }, [limpiarError]);

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearFechaOriginal = (fecha: string): string => {
    return new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const manejarConfirmarReprogramacion = async () => {
    if (!fechaSeleccionada || !horaSeleccionada) return;

    const exito = await reprogramarSesion(sesion.id, fechaSeleccionada, horaSeleccionada);
    
    if (exito) {
      onExito();
      onCerrar();
    }
  };

  const manejarSeleccionarHorario = (fecha: string, hora: string) => {
    setFechaSeleccionada(fecha);
    setHoraSeleccionada(hora);
    setMostrarConfirmacion(true);
  };

  // Filtrar fechas futuras (no permitir reprogramar para fechas pasadas)
  const fechasDisponibles = disponibilidad.filter(d => {
    const fechaDisponible = new Date(d.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fechaDisponible >= hoy && d.horarios.length > 0;
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-reprogramar">
        <div className="modal-header">
          <h2>Reprogramar Sesión</h2>
          <button onClick={onCerrar} className="btn-cerrar">×</button>
        </div>

        <div className="modal-body">
          {/* Información de la sesión actual */}
          <div className="sesion-actual-info">
            <h3>Sesión Actual</h3>
            <div className="info-actual">
              <div className="psicologo-actual">
                <img 
                  src={sesion.psicologo?.imagen || '/default-avatar.png'} 
                  alt={sesion.psicologo?.nombre}
                  className="avatar-pequeno"
                />
                <div>
                  <h4>{sesion.psicologo?.nombre} {sesion.psicologo?.apellido}</h4>
                  <p className="especialidad-actual">{sesion.especialidad}</p>
                </div>
              </div>
              <div className="fecha-actual">
                <div className="fecha-hora-original">
                  <span className="fecha-original">{formatearFechaOriginal(sesion.fecha)}</span>
                  <span className="hora-original">{sesion.hora}</span>
                  <span className="modalidad-original">
                    {sesion.modalidad === 'online' ? '💻' : '🏢'} {sesion.modalidad}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Selección de nueva fecha y hora */}
          {!mostrarConfirmacion ? (
            <div className="seleccion-nueva-fecha">
              <h3>Seleccionar Nueva Fecha y Hora</h3>
              
              {cargandoHorarios ? (
                <div className="loading-horarios">
                  <div className="loading-spinner-moderna"></div>
                  <p>Cargando horarios disponibles...</p>
                </div>
              ) : fechasDisponibles.length === 0 ? (
                <div className="sin-horarios-disponibles">
                  <div className="empty-icon">📅</div>
                  <h4>No hay horarios disponibles</h4>
                  <p>El psicólogo no tiene horarios disponibles en las próximas semanas.</p>
                </div>
              ) : (
                <div className="calendario-reprogramar">
                  {fechasDisponibles.map(dia => (
                    <div key={dia.fecha} className="dia-disponible">
                      <div className="fecha-header">
                        <h4>{formatearFecha(dia.fecha)}</h4>
                        <span className="total-horarios">{dia.horarios.length} horarios</span>
                      </div>
                      
                      <div className="horarios-grid">
                        {dia.horarios
                          .filter(horario => horario.modalidades.includes(sesion.modalidad))
                          .map(horario => (
                            <button
                              key={`${dia.fecha}-${horario.hora}`}
                              className="btn-horario-disponible"
                              onClick={() => manejarSeleccionarHorario(dia.fecha, horario.hora)}
                            >
                              <span className="hora">{horario.hora}</span>
                              <span className="modalidad">
                                {sesion.modalidad === 'online' ? '💻' : '🏢'}
                              </span>
                            </button>
                          ))
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Confirmación de reprogramación */
            <div className="confirmacion-reprogramacion">
              <h3>Confirmar Reprogramación</h3>
              
              <div className="cambio-resumen">
                <div className="cambio-de">
                  <h4>De:</h4>
                  <div className="fecha-hora-info original">
                    <span className="fecha">{formatearFechaOriginal(sesion.fecha)}</span>
                    <span className="hora">{sesion.hora}</span>
                  </div>
                </div>
                
                <div className="cambio-arrow">→</div>
                
                <div className="cambio-a">
                  <h4>A:</h4>
                  <div className="fecha-hora-info nueva">
                    <span className="fecha">{formatearFechaOriginal(fechaSeleccionada)}</span>
                    <span className="hora">{horaSeleccionada}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="error-reprogramar">
                  <p>❌ {error}</p>
                </div>
              )}

              <div className="acciones-confirmacion">
                <button 
                  onClick={() => setMostrarConfirmacion(false)}
                  className="btn-secondary"
                  disabled={reprogramando}
                >
                  Cambiar Horario
                </button>
                <button 
                  onClick={manejarConfirmarReprogramacion}
                  className="btn-primary"
                  disabled={reprogramando}
                >
                  {reprogramando ? 'Reprogramando...' : 'Confirmar Reprogramación'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};