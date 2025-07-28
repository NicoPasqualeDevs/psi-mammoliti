import React, { useState, useEffect } from 'react';
import { Psicologo, Modalidad } from '../types';

interface PlantillaSemanal {
  id?: number;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  modalidades: Modalidad[];
  activo: boolean;
}

interface ConfiguracionHorarios {
  duracionSesion: number;
  tiempoBuffer: number;
  zonaHoraria: string;
}

interface HorarioTrabajoBackend {
  id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  modalidades: Modalidad[];
  activo: boolean;
}

interface GestionHorariosProps {
  psicologo: Psicologo;
  onCerrar: () => void;
}

const diasSemana = [
  { id: 1, nombre: 'Lunes', emoji: '📅' },
  { id: 2, nombre: 'Martes', emoji: '📅' },
  { id: 3, nombre: 'Miércoles', emoji: '📅' },
  { id: 4, nombre: 'Jueves', emoji: '📅' },
  { id: 5, nombre: 'Viernes', emoji: '📅' },
  { id: 6, nombre: 'Sábado', emoji: '📅' },
  { id: 0, nombre: 'Domingo', emoji: '📅' }
];

const zonasHorarias = [
  { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
  { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' }
];

// Configuración dinámica de URL base
const getApiBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }
  return '/api';
};

export const GestionHorarios: React.FC<GestionHorariosProps> = ({ psicologo, onCerrar }) => {
  const [plantillaSemanal, setPlantillaSemanal] = useState<PlantillaSemanal[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionHorarios>({
    duracionSesion: 60,
    tiempoBuffer: 15,
    zonaHoraria: 'America/Mexico_City'
  });
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState<'success' | 'error'>('success');
  const [tabActiva, setTabActiva] = useState<'configuracion' | 'plantilla'>('configuracion');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [psicologo.id]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      // Cargar configuración
      const configResponse = await fetch(`${getApiBaseUrl()}/psicologos/${psicologo.id}/configuracion-horarios`);
      if (configResponse.ok) {
        const configData = await configResponse.json();
        setConfiguracion({
          duracionSesion: configData.duracion_sesion || 60,
          tiempoBuffer: configData.tiempo_buffer || 15,
          zonaHoraria: configData.zona_horaria || 'America/Mexico_City'
        });
      }

      // Cargar plantilla semanal
      const plantillaResponse = await fetch(`${getApiBaseUrl()}/psicologos/${psicologo.id}/horarios-trabajo`);
      if (plantillaResponse.ok) {
        const plantillaData: HorarioTrabajoBackend[] = await plantillaResponse.json();
        setPlantillaSemanal(plantillaData.map((h: HorarioTrabajoBackend) => ({
          id: h.id,
          diaSemana: h.dia_semana,
          horaInicio: h.hora_inicio,
          horaFin: h.hora_fin,
          modalidades: h.modalidades,
          activo: h.activo
        })));
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
      mostrarMensaje('Error al cargar configuración', 'error');
    } finally {
      setCargando(false);
    }
  };

  const mostrarMensaje = (msg: string, tipo: 'success' | 'error' = 'success') => {
    setMensaje(msg);
    setTipoMensaje(tipo);
    setTimeout(() => setMensaje(''), 4000);
  };

  const guardarConfiguracion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setGuardando(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/psicologos/${psicologo.id}/configuracion-horarios`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duracion_sesion: configuracion.duracionSesion,
          tiempo_buffer: configuracion.tiempoBuffer,
          zona_horaria: configuracion.zonaHoraria,
          auto_generar: 1
        })
      });

      if (response.ok) {
        mostrarMensaje('✅ Configuración guardada exitosamente');
      } else {
        throw new Error('Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarMensaje('❌ Error al guardar configuración', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const agregarHorarioDia = (diaSemana: number) => {
    const nuevaPlantilla: PlantillaSemanal = {
      diaSemana,
      horaInicio: '09:00',
      horaFin: '17:00',
      modalidades: ['online', 'presencial'],
      activo: true
    };
    setPlantillaSemanal([...plantillaSemanal, nuevaPlantilla]);
  };

  const actualizarHorarioDia = (index: number, campo: keyof PlantillaSemanal, valor: any) => {
    const nuevaPlantilla = [...plantillaSemanal];
    nuevaPlantilla[index] = { ...nuevaPlantilla[index], [campo]: valor };
    setPlantillaSemanal(nuevaPlantilla);
  };

  const eliminarHorarioDia = async (index: number) => {
    const horario = plantillaSemanal[index];
    
    if (horario.id) {
      try {
        const response = await fetch(`${getApiBaseUrl()}/horarios-trabajo/${horario.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Error al eliminar en servidor');
        }
      } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('❌ Error al eliminar horario', 'error');
        return;
      }
    }
    
    const nuevaPlantilla = plantillaSemanal.filter((_, i) => i !== index);
    setPlantillaSemanal(nuevaPlantilla);
    mostrarMensaje('✅ Horario eliminado');
  };

  const guardarPlantillaSemanal = async () => {
    setGuardando(true);
    try {
      // Eliminar horarios existentes
      const horariosExistentes = plantillaSemanal.filter(h => h.id);
      for (const horario of horariosExistentes) {
        await fetch(`${getApiBaseUrl()}/horarios-trabajo/${horario.id}`, {
          method: 'DELETE'
        });
      }

      // Crear nuevos horarios
      for (const horario of plantillaSemanal) {
        const response = await fetch(`${getApiBaseUrl()}/psicologos/${psicologo.id}/horarios-trabajo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dia_semana: horario.diaSemana,
            hora_inicio: horario.horaInicio,
            hora_fin: horario.horaFin,
            modalidades: horario.modalidades,
            activo: horario.activo
          })
        });

        if (!response.ok) {
          throw new Error(`Error al guardar horario del ${diasSemana.find(d => d.id === horario.diaSemana)?.nombre}`);
        }
      }

      mostrarMensaje('✅ Plantilla semanal guardada exitosamente');
      await cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      mostrarMensaje('❌ Error al guardar plantilla semanal', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const generarPlantillaPorDefecto = () => {
    const plantillaPorDefecto: PlantillaSemanal[] = [
      { diaSemana: 1, horaInicio: '09:00', horaFin: '18:00', modalidades: ['online', 'presencial'], activo: true },
      { diaSemana: 2, horaInicio: '09:00', horaFin: '18:00', modalidades: ['online', 'presencial'], activo: true },
      { diaSemana: 3, horaInicio: '09:00', horaFin: '18:00', modalidades: ['online', 'presencial'], activo: true },
      { diaSemana: 4, horaInicio: '09:00', horaFin: '18:00', modalidades: ['online', 'presencial'], activo: true },
      { diaSemana: 5, horaInicio: '09:00', horaFin: '18:00', modalidades: ['online', 'presencial'], activo: true },
      { diaSemana: 6, horaInicio: '10:00', horaFin: '14:00', modalidades: ['online'], activo: true }
    ];
    setPlantillaSemanal(plantillaPorDefecto);
    mostrarMensaje('✅ Plantilla por defecto cargada');
  };

  const limpiarPlantilla = () => {
    setPlantillaSemanal([]);
    mostrarMensaje('✅ Plantilla limpiada');
  };

  if (cargando) {
    return (
      <div className="modal-overlay-horarios">
        <div className="modal-content-horarios loading">
          <div className="loading-container">
            <div className="loading-spinner-horarios"></div>
            <p>Cargando configuración de horarios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay-horarios" onClick={onCerrar}>
      <div className="modal-content-horarios" onClick={e => e.stopPropagation()}>
        
        {/* Header del modal */}
        <div className="modal-header-horarios">
          <div className="header-info">
            <div className="psicologo-info-header">
              <img src={psicologo.imagen} alt={psicologo.nombre} className="psicologo-avatar-modal" />
              <div>
                <h2>🕒 Gestión de Horarios</h2>
                <p>{psicologo.nombre} {psicologo.apellido}</p>
              </div>
            </div>
          </div>
          <button onClick={onCerrar} className="btn-close-modal">
            ✕
          </button>
        </div>

        {/* Navegación por pestañas */}
        <div className="horarios-tabs">
          <button 
            className={`tab-button-horarios ${tabActiva === 'configuracion' ? 'active' : ''}`}
            onClick={() => setTabActiva('configuracion')}
          >
            ⚙️ Configuración
          </button>
          <button 
            className={`tab-button-horarios ${tabActiva === 'plantilla' ? 'active' : ''}`}
            onClick={() => setTabActiva('plantilla')}
          >
            📅 Plantilla Semanal
          </button>
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div className={`message-horarios ${tipoMensaje}`}>
            {mensaje}
          </div>
        )}

        {/* Contenido */}
        <div className="modal-body-horarios">
          
          {tabActiva === 'configuracion' && (
            <div className="config-content">
              <div className="config-header">
                <h3>⚙️ Configuración General</h3>
                <p>Establece los parámetros básicos para la generación de horarios</p>
              </div>

              <form onSubmit={guardarConfiguracion} className="config-form">
                <div className="config-grid">
                  <div className="config-field">
                    <label>
                      <span className="field-icon">⏱️</span>
                      Duración de Sesión
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        value={configuracion.duracionSesion}
                        onChange={(e) => setConfiguracion({...configuracion, duracionSesion: parseInt(e.target.value)})}
                        min="15"
                        max="180"
                        step="15"
                      />
                      <span className="input-suffix">minutos</span>
                    </div>
                    <small>Duración estándar de cada sesión terapéutica</small>
                  </div>

                  <div className="config-field">
                    <label>
                      <span className="field-icon">⏰</span>
                      Tiempo Buffer
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        value={configuracion.tiempoBuffer}
                        onChange={(e) => setConfiguracion({...configuracion, tiempoBuffer: parseInt(e.target.value)})}
                        min="0"
                        max="60"
                        step="5"
                      />
                      <span className="input-suffix">minutos</span>
                    </div>
                    <small>Tiempo de descanso entre sesiones consecutivas</small>
                  </div>

                  <div className="config-field full-width">
                    <label>
                      <span className="field-icon">🌍</span>
                      Zona Horaria
                    </label>
                    <select
                      value={configuracion.zonaHoraria}
                      onChange={(e) => setConfiguracion({...configuracion, zonaHoraria: e.target.value})}
                    >
                      {zonasHorarias.map(zona => (
                        <option key={zona.value} value={zona.value}>
                          {zona.label}
                        </option>
                      ))}
                    </select>
                    <small>Zona horaria de referencia para los horarios del psicólogo</small>
                  </div>
                </div>

                <div className="config-actions">
                  <button type="submit" disabled={guardando} className="btn-save">
                    {guardando ? '💾 Guardando...' : '💾 Guardar Configuración'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {tabActiva === 'plantilla' && (
            <div className="plantilla-content">
              <div className="plantilla-header">
                <div>
                  <h3>📅 Plantilla Semanal</h3>
                  <p>Define los horarios de trabajo para cada día de la semana</p>
                </div>
                <div className="plantilla-actions-header">
                  <button onClick={generarPlantillaPorDefecto} className="btn-template" disabled={guardando}>
                    ✨ Plantilla Sugerida
                  </button>
                  <button onClick={limpiarPlantilla} className="btn-clear" disabled={guardando}>
                    🗑️ Limpiar Todo
                  </button>
                  <button onClick={guardarPlantillaSemanal} className="btn-save" disabled={guardando}>
                    {guardando ? '💾 Guardando...' : '💾 Guardar Plantilla'}
                  </button>
                </div>
              </div>

              <div className="days-container">
                {diasSemana.map(dia => {
                  const horariosDelDia = plantillaSemanal.filter(h => h.diaSemana === dia.id);
                  
                  return (
                    <div key={dia.id} className="day-card">
                      <div className="day-header">
                        <div className="day-info">
                          <span className="day-emoji">{dia.emoji}</span>
                          <span className="day-name">{dia.nombre}</span>
                        </div>
                        <div className="day-stats">
                          <span className="horarios-count">
                            {horariosDelDia.length} horario{horariosDelDia.length !== 1 ? 's' : ''}
                          </span>
                          <button
                            onClick={() => agregarHorarioDia(dia.id)}
                            className="btn-add-horario"
                            disabled={guardando}
                          >
                            ➕
                          </button>
                        </div>
                      </div>

                      {horariosDelDia.length === 0 ? (
                        <div className="empty-day">
                          <span className="empty-icon">📭</span>
                          <p>Sin horarios configurados</p>
                          <button
                            onClick={() => agregarHorarioDia(dia.id)}
                            className="btn-add-first"
                            disabled={guardando}
                          >
                            ➕ Agregar primer horario
                          </button>
                        </div>
                      ) : (
                        <div className="horarios-list">
                          {horariosDelDia.map((horario, index) => {
                            const realIndex = plantillaSemanal.findIndex(h => h === horario);
                            return (
                              <div key={realIndex} className="horario-item">
                                <div className="horario-times">
                                  <div className="time-field">
                                    <label>Inicio</label>
                                    <input
                                      type="time"
                                      value={horario.horaInicio}
                                      onChange={(e) => actualizarHorarioDia(realIndex, 'horaInicio', e.target.value)}
                                      disabled={guardando}
                                    />
                                  </div>
                                  <div className="time-separator">→</div>
                                  <div className="time-field">
                                    <label>Fin</label>
                                    <input
                                      type="time"
                                      value={horario.horaFin}
                                      onChange={(e) => actualizarHorarioDia(realIndex, 'horaFin', e.target.value)}
                                      disabled={guardando}
                                    />
                                  </div>
                                </div>

                                <div className="horario-modalidades">
                                  <label>Modalidades</label>
                                  <div className="modalidades-checkboxes-horarios">
                                    <label className="checkbox-label-horarios">
                                      <input
                                        type="checkbox"
                                        checked={horario.modalidades.includes('online')}
                                        onChange={(e) => {
                                          const modalidades = e.target.checked
                                            ? [...horario.modalidades.filter(m => m !== 'online'), 'online']
                                            : horario.modalidades.filter(m => m !== 'online');
                                          actualizarHorarioDia(realIndex, 'modalidades', modalidades);
                                        }}
                                        disabled={guardando}
                                      />
                                      <span>💻 Online</span>
                                    </label>
                                    <label className="checkbox-label-horarios">
                                      <input
                                        type="checkbox"
                                        checked={horario.modalidades.includes('presencial')}
                                        onChange={(e) => {
                                          const modalidades = e.target.checked
                                            ? [...horario.modalidades.filter(m => m !== 'presencial'), 'presencial']
                                            : horario.modalidades.filter(m => m !== 'presencial');
                                          actualizarHorarioDia(realIndex, 'modalidades', modalidades);
                                        }}
                                        disabled={guardando}
                                      />
                                      <span>🏢 Presencial</span>
                                    </label>
                                  </div>
                                </div>

                                <div className="horario-actions">
                                  <label className="switch-label">
                                    <input
                                      type="checkbox"
                                      checked={horario.activo}
                                      onChange={(e) => actualizarHorarioDia(realIndex, 'activo', e.target.checked)}
                                      disabled={guardando}
                                    />
                                    <span className="switch-slider"></span>
                                    <span className="switch-text">
                                      {horario.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                  </label>
                                  
                                  <button
                                    onClick={() => eliminarHorarioDia(realIndex)}
                                    className="btn-delete-horario"
                                    disabled={guardando}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer del modal */}
        <div className="modal-footer-horarios">
          <button onClick={onCerrar} className="btn-close" disabled={guardando}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}; 