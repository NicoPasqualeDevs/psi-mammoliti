import React, { useState, useEffect } from 'react';
import { 
  HorarioTrabajo, 
  HorarioExcepcion, 
  ConfiguracionHorarios, 
  Modalidad,
  Psicologo 
} from '../types';
import { HorariosService } from '../services/horariosService';

interface GestionHorariosProps {
  psicologo: Psicologo;
  onCerrar: () => void;
}

export const GestionHorarios: React.FC<GestionHorariosProps> = ({ psicologo, onCerrar }) => {
  // Estados principales
  const [vistaActual, setVistaActual] = useState<'configuracion' | 'horarios' | 'excepciones'>('configuracion');
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  
  // Estados de datos
  const [configuracion, setConfiguracion] = useState<ConfiguracionHorarios | null>(null);
  const [horariosTrabajoSemanales, setHorariosTrabajoSemanales] = useState<HorarioTrabajo[]>([]);
  const [excepciones, setExcepciones] = useState<HorarioExcepcion[]>([]);
  
  // Estados de formularios
  const [mostrarFormularioHorario, setMostrarFormularioHorario] = useState(false);
  const [mostrarFormularioExcepcion, setMostrarFormularioExcepcion] = useState(false);
  const [horarioEditando, setHorarioEditando] = useState<HorarioTrabajo | null>(null);

  const [formularioHorario, setFormularioHorario] = useState({
    diaSemana: 1,
    horaInicio: '09:00',
    horaFin: '17:00',
    modalidades: ['online'] as Modalidad[],
    activo: true
  });

  const [formularioExcepcion, setFormularioExcepcion] = useState({
    fecha: '',
    tipo: 'bloqueado' as 'bloqueado' | 'horario_especial',
    horaInicio: '09:00',
    horaFin: '17:00',
    modalidades: ['online'] as Modalidad[],
    motivo: ''
  });

  const [formularioConfiguracion, setFormularioConfiguracion] = useState({
    duracionSesion: 60,
    tiempoBuffer: 15,
    diasAnticipacion: 30,
    zonaHoraria: 'America/Mexico_City',
    autoGenerar: true
  });

  const diasSemana = [
    { valor: 1, nombre: 'Lunes' },
    { valor: 2, nombre: 'Martes' },
    { valor: 3, nombre: 'Miércoles' },
    { valor: 4, nombre: 'Jueves' },
    { valor: 5, nombre: 'Viernes' },
    { valor: 6, nombre: 'Sábado' },
    { valor: 0, nombre: 'Domingo' }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, [psicologo.id]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // Cargar configuración
      const respConfig = await fetch(`/api/psicologos/${psicologo.id}/configuracion-horarios`);
      if (respConfig.ok) {
        const configData = await respConfig.json();
        setConfiguracion(configData);
        setFormularioConfiguracion({
          duracionSesion: configData.duracion_sesion,
          tiempoBuffer: configData.tiempo_buffer,
          diasAnticipacion: configData.dias_anticipacion,
          zonaHoraria: configData.zona_horaria,
          autoGenerar: configData.auto_generar === 1
        });
      }

      // Cargar horarios de trabajo
      const respHorarios = await fetch(`/api/psicologos/${psicologo.id}/horarios-trabajo`);
      if (respHorarios.ok) {
        const horariosData = await respHorarios.json();
        setHorariosTrabajoSemanales(horariosData);
      }

      // Cargar excepciones
      const respExcepciones = await fetch(`/api/psicologos/${psicologo.id}/horarios-excepciones`);
      if (respExcepciones.ok) {
        const excepcionesData = await respExcepciones.json();
        setExcepciones(excepcionesData);
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
      mostrarMensaje('Error al cargar los datos de horarios', 'error');
    } finally {
      setCargando(false);
    }
  };

  const mostrarMensaje = (msg: string, tipo: 'success' | 'error' = 'success') => {
    setMensaje(msg);
    setTimeout(() => setMensaje(''), 5000);
  };

  // Gestión de configuración
  const guardarConfiguracion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/psicologos/${psicologo.id}/configuracion-horarios`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duracion_sesion: formularioConfiguracion.duracionSesion,
          tiempo_buffer: formularioConfiguracion.tiempoBuffer,
          dias_anticipacion: formularioConfiguracion.diasAnticipacion,
          zona_horaria: formularioConfiguracion.zonaHoraria,
          auto_generar: formularioConfiguracion.autoGenerar ? 1 : 0
        })
      });

      if (response.ok) {
        mostrarMensaje('✅ Configuración guardada exitosamente');
        await cargarDatos();
      } else {
        throw new Error('Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error guardando configuración:', error);
      mostrarMensaje('❌ Error al guardar la configuración', 'error');
    }
  };

  // Gestión de horarios de trabajo
  const iniciarCreacionHorario = () => {
    setHorarioEditando(null);
    setFormularioHorario({
      diaSemana: 1,
      horaInicio: '09:00',
      horaFin: '17:00',
      modalidades: psicologo.modalidades,
      activo: true
    });
    setMostrarFormularioHorario(true);
  };

  const iniciarEdicionHorario = (horario: HorarioTrabajo) => {
    setHorarioEditando(horario);
    setFormularioHorario({
      diaSemana: horario.dia_semana,
      horaInicio: horario.hora_inicio,
      horaFin: horario.hora_fin,
      modalidades: horario.modalidades,
      activo: horario.activo
    });
    setMostrarFormularioHorario(true);
  };

  const guardarHorarioTrabajo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar horario
    const errores = HorariosService.validarHorarioTrabajo({
      psicologoId: psicologo.id,
      diaSemana: formularioHorario.diaSemana,
      horaInicio: formularioHorario.horaInicio,
      horaFin: formularioHorario.horaFin,
      modalidades: formularioHorario.modalidades,
      activo: formularioHorario.activo
    });

    if (errores.length > 0) {
      mostrarMensaje(`❌ ${errores[0]}`, 'error');
      return;
    }

    try {
      let response;
      if (horarioEditando) {
        // Actualizar
        response = await fetch(`/api/horarios-trabajo/${horarioEditando.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dia_semana: formularioHorario.diaSemana,
            hora_inicio: formularioHorario.horaInicio,
            hora_fin: formularioHorario.horaFin,
            modalidades: formularioHorario.modalidades,
            activo: formularioHorario.activo
          })
        });
      } else {
        // Crear
        response = await fetch(`/api/psicologos/${psicologo.id}/horarios-trabajo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dia_semana: formularioHorario.diaSemana,
            hora_inicio: formularioHorario.horaInicio,
            hora_fin: formularioHorario.horaFin,
            modalidades: formularioHorario.modalidades,
            activo: formularioHorario.activo
          })
        });
      }

      if (response.ok) {
        mostrarMensaje(`✅ Horario ${horarioEditando ? 'actualizado' : 'creado'} exitosamente`);
        setMostrarFormularioHorario(false);
        await cargarDatos();
      } else {
        throw new Error('Error al guardar horario');
      }
    } catch (error) {
      console.error('Error guardando horario:', error);
      mostrarMensaje('❌ Error al guardar el horario', 'error');
    }
  };

  const eliminarHorarioTrabajo = async (id: number, diaTexto: string) => {
    if (!window.confirm(`¿Eliminar el horario del ${diaTexto}?`)) return;

    try {
      const response = await fetch(`/api/horarios-trabajo/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        mostrarMensaje('✅ Horario eliminado exitosamente');
        await cargarDatos();
      } else {
        throw new Error('Error al eliminar horario');
      }
    } catch (error) {
      console.error('Error eliminando horario:', error);
      mostrarMensaje('❌ Error al eliminar el horario', 'error');
    }
  };

  // Gestión de excepciones
  const guardarExcepcion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/psicologos/${psicologo.id}/horarios-excepciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha: formularioExcepcion.fecha,
          tipo: formularioExcepcion.tipo,
          hora_inicio: formularioExcepcion.tipo === 'horario_especial' ? formularioExcepcion.horaInicio : null,
          hora_fin: formularioExcepcion.tipo === 'horario_especial' ? formularioExcepcion.horaFin : null,
          modalidades: formularioExcepcion.tipo === 'horario_especial' ? formularioExcepcion.modalidades : null,
          motivo: formularioExcepcion.motivo
        })
      });

      if (response.ok) {
        mostrarMensaje('✅ Excepción creada exitosamente');
        setMostrarFormularioExcepcion(false);
        setFormularioExcepcion({
          fecha: '',
          tipo: 'bloqueado',
          horaInicio: '09:00',
          horaFin: '17:00',
          modalidades: ['online'],
          motivo: ''
        });
        await cargarDatos();
      } else {
        throw new Error('Error al crear excepción');
      }
    } catch (error) {
      console.error('Error creando excepción:', error);
      mostrarMensaje('❌ Error al crear la excepción', 'error');
    }
  };

  const eliminarExcepcion = async (id: number, fecha: string) => {
    if (!window.confirm(`¿Eliminar la excepción del ${fecha}?`)) return;

    try {
      const response = await fetch(`/api/horarios-excepciones/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        mostrarMensaje('✅ Excepción eliminada exitosamente');
        await cargarDatos();
      } else {
        throw new Error('Error al eliminar excepción');
      }
    } catch (error) {
      console.error('Error eliminando excepción:', error);
      mostrarMensaje('❌ Error al eliminar la excepción', 'error');
    }
  };

  const generarHorariosPorDefecto = async () => {
    if (!window.confirm('¿Generar horarios por defecto (Lunes a Viernes 9:00-17:00)? Esto no afectará los horarios existentes.')) return;

    try {
      const horariosExistentes = new Set(horariosTrabajoSemanales.map(h => h.dia_semana));
      const promesas = [];

      for (let dia = 1; dia <= 5; dia++) {
        if (!horariosExistentes.has(dia)) {
          const promesa = fetch(`/api/psicologos/${psicologo.id}/horarios-trabajo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dia_semana: dia,
              hora_inicio: '09:00',
              hora_fin: '17:00',
              modalidades: psicologo.modalidades,
              activo: true
            })
          });
          promesas.push(promesa);
        }
      }

      await Promise.all(promesas);
      mostrarMensaje('✅ Horarios por defecto generados exitosamente');
      await cargarDatos();
    } catch (error) {
      console.error('Error generando horarios por defecto:', error);
      mostrarMensaje('❌ Error al generar horarios por defecto', 'error');
    }
  };

  if (cargando) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="loading-spinner"></div>
            <p>Cargando gestión de horarios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content gestion-horarios">
        <div className="modal-header">
          <h2>🕒 Gestión de Horarios - {psicologo.nombre} {psicologo.apellido}</h2>
          <button className="btn-cerrar" onClick={onCerrar}>×</button>
        </div>

        {mensaje && (
          <div className={`admin-message ${mensaje.includes('❌') ? 'error' : 'success'}`}>
            {mensaje}
          </div>
        )}

        <div className="navegacion-gestion">
          <button
            className={`btn-vista ${vistaActual === 'configuracion' ? 'activo' : ''}`}
            onClick={() => setVistaActual('configuracion')}
          >
            ⚙️ Configuración
          </button>
          <button
            className={`btn-vista ${vistaActual === 'horarios' ? 'activo' : ''}`}
            onClick={() => setVistaActual('horarios')}
          >
            📅 Horarios Semanales
          </button>
          <button
            className={`btn-vista ${vistaActual === 'excepciones' ? 'activo' : ''}`}
            onClick={() => setVistaActual('excepciones')}
          >
            🚫 Excepciones
          </button>
        </div>

        <div className="contenido-gestion">
          {vistaActual === 'configuracion' && (
            <div className="seccion-configuracion">
              <h3>Configuración General</h3>
              <form onSubmit={guardarConfiguracion}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Duración de sesión (minutos):</label>
                    <input
                      type="number"
                      min="30"
                      max="180"
                      step="15"
                      value={formularioConfiguracion.duracionSesion}
                      onChange={(e) => setFormularioConfiguracion({
                        ...formularioConfiguracion,
                        duracionSesion: parseInt(e.target.value)
                      })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tiempo entre sesiones (minutos):</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      step="5"
                      value={formularioConfiguracion.tiempoBuffer}
                      onChange={(e) => setFormularioConfiguracion({
                        ...formularioConfiguracion,
                        tiempoBuffer: parseInt(e.target.value)
                      })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Días máximos de anticipación:</label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={formularioConfiguracion.diasAnticipacion}
                      onChange={(e) => setFormularioConfiguracion({
                        ...formularioConfiguracion,
                        diasAnticipacion: parseInt(e.target.value)
                      })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Zona horaria:</label>
                    <select
                      value={formularioConfiguracion.zonaHoraria}
                      onChange={(e) => setFormularioConfiguracion({
                        ...formularioConfiguracion,
                        zonaHoraria: e.target.value
                      })}
                    >
                      <option value="America/Mexico_City">México (Ciudad de México)</option>
                      <option value="America/Tijuana">México (Tijuana)</option>
                      <option value="America/Cancun">México (Cancún)</option>
                      <option value="America/New_York">Estados Unidos (Este)</option>
                      <option value="America/Los_Angeles">Estados Unidos (Oeste)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formularioConfiguracion.autoGenerar}
                      onChange={(e) => setFormularioConfiguracion({
                        ...formularioConfiguracion,
                        autoGenerar: e.target.checked
                      })}
                    />
                    Generar horarios automáticamente basado en plantillas semanales
                  </label>
                </div>

                <button type="submit" className="btn-primary">
                  💾 Guardar Configuración
                </button>
              </form>
            </div>
          )}

          {vistaActual === 'horarios' && (
            <div className="seccion-horarios">
              <div className="header-seccion">
                <h3>Horarios de Trabajo Semanales</h3>
                <div className="acciones-horarios">
                  <button
                    onClick={iniciarCreacionHorario}
                    className="btn-secondary"
                  >
                    ➕ Nuevo Horario
                  </button>
                  <button
                    onClick={generarHorariosPorDefecto}
                    className="btn-outline"
                  >
                    🔄 Generar Por Defecto
                  </button>
                </div>
              </div>

              <div className="lista-horarios">
                {horariosTrabajoSemanales.length === 0 ? (
                  <div className="empty-state">
                    <p>No tienes horarios de trabajo configurados</p>
                    <button onClick={generarHorariosPorDefecto} className="btn-primary">
                      Generar Horarios Por Defecto
                    </button>
                  </div>
                ) : (
                  <div className="horarios-grid">
                    {diasSemana.map(dia => {
                      const horariosDia = horariosTrabajoSemanales.filter(h => h.dia_semana === dia.valor);
                      return (
                        <div key={dia.valor} className="dia-horarios">
                          <h4>{dia.nombre}</h4>
                          {horariosDia.length === 0 ? (
                            <p className="sin-horarios">Sin horarios</p>
                          ) : (
                            horariosDia.map(horario => (
                              <div key={horario.id} className="horario-item">
                                <div className="horario-info">
                                  <span className="horario-tiempo">
                                    {horario.hora_inicio} - {horario.hora_fin}
                                  </span>
                                  <span className="horario-modalidades">
                                    {horario.modalidades.map(m => m === 'online' ? '💻' : '🏢').join(' ')}
                                  </span>
                                  <span className={`horario-estado ${horario.activo ? 'activo' : 'inactivo'}`}>
                                    {horario.activo ? 'Activo' : 'Inactivo'}
                                  </span>
                                </div>
                                <div className="horario-acciones">
                                  <button
                                    onClick={() => iniciarEdicionHorario(horario)}
                                    className="btn-edit-small"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => eliminarHorarioTrabajo(horario.id!, dia.nombre)}
                                    className="btn-delete-small"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {mostrarFormularioHorario && (
                <div className="formulario-overlay">
                  <div className="formulario-horario">
                    <h4>{horarioEditando ? 'Editar' : 'Nuevo'} Horario de Trabajo</h4>
                    <form onSubmit={guardarHorarioTrabajo}>
                      <div className="form-group">
                        <label>Día de la semana:</label>
                        <select
                          value={formularioHorario.diaSemana}
                          onChange={(e) => setFormularioHorario({
                            ...formularioHorario,
                            diaSemana: parseInt(e.target.value)
                          })}
                        >
                          {diasSemana.map(dia => (
                            <option key={dia.valor} value={dia.valor}>{dia.nombre}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Hora inicio:</label>
                          <input
                            type="time"
                            value={formularioHorario.horaInicio}
                            onChange={(e) => setFormularioHorario({
                              ...formularioHorario,
                              horaInicio: e.target.value
                            })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Hora fin:</label>
                          <input
                            type="time"
                            value={formularioHorario.horaFin}
                            onChange={(e) => setFormularioHorario({
                              ...formularioHorario,
                              horaFin: e.target.value
                            })}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Modalidades disponibles:</label>
                        <div className="modalidades-checkbox">
                          <label>
                            <input
                              type="checkbox"
                              checked={formularioHorario.modalidades.includes('online')}
                              onChange={(e) => {
                                const modalidades = e.target.checked
                                  ? [...formularioHorario.modalidades, 'online']
                                  : formularioHorario.modalidades.filter(m => m !== 'online');
                                setFormularioHorario({...formularioHorario, modalidades});
                              }}
                            />
                            💻 Online
                          </label>
                          <label>
                            <input
                              type="checkbox"
                              checked={formularioHorario.modalidades.includes('presencial')}
                              onChange={(e) => {
                                const modalidades = e.target.checked
                                  ? [...formularioHorario.modalidades, 'presencial']
                                  : formularioHorario.modalidades.filter(m => m !== 'presencial');
                                setFormularioHorario({...formularioHorario, modalidades});
                              }}
                            />
                            🏢 Presencial
                          </label>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={formularioHorario.activo}
                            onChange={(e) => setFormularioHorario({
                              ...formularioHorario,
                              activo: e.target.checked
                            })}
                          />
                          Horario activo
                        </label>
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="btn-primary">
                          {horarioEditando ? 'Actualizar' : 'Crear'} Horario
                        </button>
                        <button
                          type="button"
                          onClick={() => setMostrarFormularioHorario(false)}
                          className="btn-secondary"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {vistaActual === 'excepciones' && (
            <div className="seccion-excepciones">
              <div className="header-seccion">
                <h3>Excepciones de Horarios</h3>
                <button
                  onClick={() => setMostrarFormularioExcepcion(!mostrarFormularioExcepcion)}
                  className="btn-secondary"
                >
                  {mostrarFormularioExcepcion ? '❌ Cancelar' : '➕ Nueva Excepción'}
                </button>
              </div>

              {mostrarFormularioExcepcion && (
                <div className="formulario-excepcion">
                  <h4>Nueva Excepción</h4>
                  <form onSubmit={guardarExcepcion}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Fecha:</label>
                        <input
                          type="date"
                          value={formularioExcepcion.fecha}
                          onChange={(e) => setFormularioExcepcion({
                            ...formularioExcepcion,
                            fecha: e.target.value
                          })}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Tipo:</label>
                        <select
                          value={formularioExcepcion.tipo}
                          onChange={(e) => setFormularioExcepcion({
                            ...formularioExcepcion,
                            tipo: e.target.value as 'bloqueado' | 'horario_especial'
                          })}
                        >
                          <option value="bloqueado">🚫 Día bloqueado</option>
                          <option value="horario_especial">🕒 Horario especial</option>
                        </select>
                      </div>
                    </div>

                    {formularioExcepcion.tipo === 'horario_especial' && (
                      <>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Hora inicio:</label>
                            <input
                              type="time"
                              value={formularioExcepcion.horaInicio}
                              onChange={(e) => setFormularioExcepcion({
                                ...formularioExcepcion,
                                horaInicio: e.target.value
                              })}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Hora fin:</label>
                            <input
                              type="time"
                              value={formularioExcepcion.horaFin}
                              onChange={(e) => setFormularioExcepcion({
                                ...formularioExcepcion,
                                horaFin: e.target.value
                              })}
                              required
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Modalidades disponibles:</label>
                          <div className="modalidades-checkbox">
                            <label>
                              <input
                                type="checkbox"
                                checked={formularioExcepcion.modalidades.includes('online')}
                                onChange={(e) => {
                                  const modalidades = e.target.checked
                                    ? [...formularioExcepcion.modalidades, 'online']
                                    : formularioExcepcion.modalidades.filter(m => m !== 'online');
                                  setFormularioExcepcion({...formularioExcepcion, modalidades});
                                }}
                              />
                              💻 Online
                            </label>
                            <label>
                              <input
                                type="checkbox"
                                checked={formularioExcepcion.modalidades.includes('presencial')}
                                onChange={(e) => {
                                  const modalidades = e.target.checked
                                    ? [...formularioExcepcion.modalidades, 'presencial']
                                    : formularioExcepcion.modalidades.filter(m => m !== 'presencial');
                                  setFormularioExcepcion({...formularioExcepcion, modalidades});
                                }}
                              />
                              🏢 Presencial
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="form-group">
                      <label>Motivo (opcional):</label>
                      <input
                        type="text"
                        value={formularioExcepcion.motivo}
                        onChange={(e) => setFormularioExcepcion({
                          ...formularioExcepcion,
                          motivo: e.target.value
                        })}
                        placeholder="Ej: Vacaciones, conferencia, etc."
                      />
                    </div>

                    <button type="submit" className="btn-primary">
                      Crear Excepción
                    </button>
                  </form>
                </div>
              )}

              <div className="lista-excepciones">
                {excepciones.length === 0 ? (
                  <div className="empty-state">
                    <p>No tienes excepciones configuradas</p>
                  </div>
                ) : (
                  excepciones.map(excepcion => (
                    <div key={excepcion.id} className="excepcion-item">
                      <div className="excepcion-info">
                        <span className="excepcion-fecha">
                          {new Date(excepcion.fecha).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span className={`excepcion-tipo ${excepcion.tipo}`}>
                          {excepcion.tipo === 'bloqueado' ? '🚫 Bloqueado' : '🕒 Horario especial'}
                        </span>
                        {excepcion.tipo === 'horario_especial' && (
                          <span className="excepcion-horario">
                            {excepcion.hora_inicio} - {excepcion.hora_fin}
                          </span>
                        )}
                        {excepcion.motivo && (
                          <span className="excepcion-motivo">{excepcion.motivo}</span>
                        )}
                      </div>
                      <button
                        onClick={() => eliminarExcepcion(excepcion.id!, excepcion.fecha)}
                        className="btn-delete-small"
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 