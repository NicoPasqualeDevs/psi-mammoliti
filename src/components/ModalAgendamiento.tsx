import React, { useState } from 'react';
import { Psicologo, Sesion, Modalidad } from '../types';
import { CalendarioDisponibilidad } from './CalendarioDisponibilidad';
import { detectarTimezone } from '../utils/timezone';

interface ModalAgendamientoProps {
  psicologo: Psicologo | null;
  onCerrar: () => void;
  onAgendar: (sesion: Omit<Sesion, 'id' | 'estado'>) => void;
}

const getModalidadEmoji = (modalidad: string): string => {
  return modalidad === 'online' ? '💻' : '🏢';
};

const getModalidadTexto = (modalidad: string): string => {
  return modalidad === 'online' ? 'Online' : 'Presencial';
};

export const ModalAgendamiento: React.FC<ModalAgendamientoProps> = ({
  psicologo,
  onCerrar,
  onAgendar
}) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [horaLocal, setHoraLocal] = useState('');
  const [modalidadesDisponibles, setModalidadesDisponibles] = useState<Modalidad[]>([]);
  const [modalidadSeleccionada, setModalidadSeleccionada] = useState<Modalidad | ''>('');
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
  const [datosPersonales, setDatosPersonales] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });
  const [vistaCalendario, setVistaCalendario] = useState(true);

  const timezoneUsuario = detectarTimezone();

  if (!psicologo) return null;

  const handleSeleccionarHorario = (fecha: string, hora: string, horaLocalCalculada: string, modalidades: string[]) => {
    setFechaSeleccionada(fecha);
    setHoraSeleccionada(hora);
    setHoraLocal(horaLocalCalculada);
    setModalidadesDisponibles(modalidades as Modalidad[]);
    
    if (modalidades.length === 1) {
      setModalidadSeleccionada(modalidades[0] as Modalidad);
    } else {
      setModalidadSeleccionada('');
    }
    
    setVistaCalendario(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fechaSeleccionada || !horaSeleccionada || !modalidadSeleccionada || 
        !especialidadSeleccionada || !datosPersonales.nombre || !datosPersonales.email) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    onAgendar({
      psicologoId: psicologo.id,
      fecha: fechaSeleccionada,
      hora: horaSeleccionada,
      modalidad: modalidadSeleccionada,
      paciente: datosPersonales,
      especialidad: especialidadSeleccionada
    });

    onCerrar();
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Agendar sesión con {psicologo.nombre} {psicologo.apellido}</h2>
          <button className="btn-cerrar" onClick={onCerrar}>×</button>
        </div>

        <div className="navegacion-modal">
          <button
            type="button"
            className={`btn-vista ${vistaCalendario ? 'activo' : ''}`}
            onClick={() => setVistaCalendario(true)}
          >
            📅 Vista Calendario
          </button>
          <button
            type="button"
            className={`btn-vista ${!vistaCalendario ? 'activo' : ''}`}
            onClick={() => setVistaCalendario(false)}
          >
            📝 Datos de la Sesión
          </button>
        </div>

        {vistaCalendario ? (
          <div className="seccion-calendario">
            <CalendarioDisponibilidad
              psicologo={psicologo}
              onSeleccionarHorario={handleSeleccionarHorario}
              fechaSeleccionada={fechaSeleccionada}
              horaSeleccionada={horaSeleccionada}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="formulario-agendamiento">
            {fechaSeleccionada && horaSeleccionada && (
              <div className="sesion-seleccionada">
                <h4>Horario Seleccionado:</h4>
                <div className="horario-detalles">
                  <p><strong>Fecha:</strong> {new Date(fechaSeleccionada).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                  <p><strong>Hora (psicólogo):</strong> {horaSeleccionada}</p>
                  <p><strong>Hora (tu zona):</strong> {horaLocal}</p>
                  <p><strong>Tu zona horaria:</strong> {timezoneUsuario}</p>
                  {modalidadesDisponibles.length > 0 && (
                    <p><strong>Modalidades disponibles:</strong> {modalidadesDisponibles.map(m => `${getModalidadEmoji(m)} ${getModalidadTexto(m)}`).join(', ')}</p>
                  )}
                </div>
                <button 
                  type="button" 
                  className="btn-cambiar-horario"
                  onClick={() => setVistaCalendario(true)}
                >
                  🔄 Cambiar Horario
                </button>
              </div>
            )}

            {!fechaSeleccionada && (
              <div className="sin-seleccion">
                <p>Por favor selecciona un horario en el calendario para continuar</p>
                <button 
                  type="button" 
                  className="btn-ir-calendario"
                  onClick={() => setVistaCalendario(true)}
                >
                  📅 Ir al Calendario
                </button>
              </div>
            )}

            {fechaSeleccionada && (
              <>
                {modalidadesDisponibles.length > 1 && (
                  <div className="campo-grupo">
                    <label>Modalidad de la sesión:</label>
                    <select 
                      value={modalidadSeleccionada} 
                      onChange={e => setModalidadSeleccionada(e.target.value as Modalidad)}
                      required
                    >
                      <option value="">Selecciona una modalidad</option>
                      {modalidadesDisponibles.map(modalidad => (
                        <option key={modalidad} value={modalidad}>
                          {getModalidadEmoji(modalidad)} {getModalidadTexto(modalidad)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {modalidadesDisponibles.length === 1 && (
                  <div className="campo-grupo">
                    <label>Modalidad de la sesión:</label>
                    <div className="modalidad-unica">
                      {getModalidadEmoji(modalidadesDisponibles[0])} {getModalidadTexto(modalidadesDisponibles[0])}
                    </div>
                  </div>
                )}

                <div className="campo-grupo">
                  <label>Especialidad:</label>
                  <select 
                    value={especialidadSeleccionada} 
                    onChange={e => setEspecialidadSeleccionada(e.target.value)}
                    required
                  >
                    <option value="">Selecciona una especialidad</option>
                    {psicologo.especialidades.map(esp => (
                      <option key={esp} value={esp}>{esp}</option>
                    ))}
                  </select>
                </div>

                <h3>Datos personales</h3>
                
                <div className="campo-grupo">
                  <label>Nombre completo:</label>
                  <input
                    type="text"
                    value={datosPersonales.nombre}
                    onChange={e => setDatosPersonales({...datosPersonales, nombre: e.target.value})}
                    required
                  />
                </div>

                <div className="campo-grupo">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={datosPersonales.email}
                    onChange={e => setDatosPersonales({...datosPersonales, email: e.target.value})}
                    required
                  />
                </div>

                <div className="campo-grupo">
                  <label>Teléfono:</label>
                  <input
                    type="tel"
                    value={datosPersonales.telefono}
                    onChange={e => setDatosPersonales({...datosPersonales, telefono: e.target.value})}
                  />
                </div>

                <div className="resumen-sesion">
                  <h4>Resumen de la sesión:</h4>
                  <p><strong>Psicólogo:</strong> {psicologo.nombre} {psicologo.apellido}</p>
                  <p><strong>Precio:</strong> ${psicologo.precio}</p>
                  <p><strong>Fecha:</strong> {new Date(fechaSeleccionada).toLocaleDateString('es-ES')}</p>
                  <p><strong>Hora (psicólogo):</strong> {horaSeleccionada}</p>
                  <p><strong>Hora (tu zona):</strong> {horaLocal}</p>
                  {modalidadSeleccionada && <p><strong>Modalidad:</strong> {getModalidadEmoji(modalidadSeleccionada)} {getModalidadTexto(modalidadSeleccionada)}</p>}
                  {especialidadSeleccionada && <p><strong>Especialidad:</strong> {especialidadSeleccionada}</p>}
                </div>

                <div className="botones-modal">
                  <button type="button" onClick={onCerrar} className="btn-cancelar">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-confirmar">
                    Confirmar Agendamiento
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}; 