import React, { useState } from 'react';
import { Psicologo, Sesion, Modalidad } from '../types';
import { CalendarioDisponibilidad } from './CalendarioDisponibilidad';
import { useHorariosReales, useAgendarCita } from '../hooks/useHorariosReales';

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
  const [vistaCalendario, setVistaCalendario] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>('');
  const [horaLocal, setHoraLocal] = useState<string>('');
  const [modalidadesDisponibles, setModalidadesDisponibles] = useState<string[]>([]);
  const [modalidadSeleccionada, setModalidadSeleccionada] = useState<Modalidad | ''>('');
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState<string>('');
  
  const [datosPersonales, setDatosPersonales] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });

  // Hooks para horarios reales y agendamiento
  const { configuracion } = useHorariosReales({ 
    psicologoId: psicologo?.id || '',
    habilitado: !!psicologo 
  });
  
  const { agendarCita, agendando, error: errorAgendamiento } = useAgendarCita();

  if (!psicologo) return null;

  const handleSeleccionarHorario = (fecha: string, hora: string, horaLocalCalculada: string, modalidades: string[]) => {
    setFechaSeleccionada(fecha);
    setHoraSeleccionada(hora);
    setHoraLocal(horaLocalCalculada);
    setModalidadesDisponibles(modalidades);
    
    // Auto-seleccionar modalidad si solo hay una disponible
    if (modalidades.length === 1) {
      setModalidadSeleccionada(modalidades[0] as Modalidad);
    } else {
      setModalidadSeleccionada('');
    }
    
    // Auto-seleccionar especialidad si solo hay una
    if (psicologo.especialidades.length === 1) {
      setEspecialidadSeleccionada(psicologo.especialidades[0]);
    }
    
    setVistaCalendario(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fechaSeleccionada || !horaSeleccionada || !modalidadSeleccionada || 
        !especialidadSeleccionada || !datosPersonales.nombre || !datosPersonales.email) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      // Usar duración de la configuración o 60 minutos por defecto
      const duracionMinutos = configuracion?.duracionSesion || 60;

      // Agendar la cita usando el sistema real
      const resultado = await agendarCita({
        psicologoId: psicologo.id,
        fecha: fechaSeleccionada,
        hora: horaSeleccionada,
        modalidad: modalidadSeleccionada,
        duracionMinutos,
        pacienteNombre: datosPersonales.nombre,
        pacienteEmail: datosPersonales.email,
        pacienteTelefono: datosPersonales.telefono,
        especialidad: especialidadSeleccionada
      });

      // Crear objeto de sesión para compatibilidad con el componente padre
      const sesion: Omit<Sesion, 'id' | 'estado'> = {
        psicologoId: psicologo.id,
        fecha: fechaSeleccionada,
        hora: horaSeleccionada,
        modalidad: modalidadSeleccionada,
        paciente: datosPersonales,
        especialidad: especialidadSeleccionada
      };

      // Llamar al callback del padre
      onAgendar(sesion);

      // Mostrar mensaje de éxito
      alert(`¡Cita agendada exitosamente! 
      
Detalles:
• Fecha: ${new Date(fechaSeleccionada).toLocaleDateString('es-ES', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
• Hora: ${horaSeleccionada} (${duracionMinutos} minutos)
• Modalidad: ${getModalidadTexto(modalidadSeleccionada)}
• Psicólogo: ${psicologo.nombre} ${psicologo.apellido}
• Especialidad: ${especialidadSeleccionada}

ID de la cita: ${resultado.citaId}
ID de la sesión: ${resultado.sesionId}`);

      onCerrar();

    } catch (error) {
      console.error('Error al agendar cita:', error);
      alert(`Error al agendar la cita: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
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
            disabled={!fechaSeleccionada || !horaSeleccionada}
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
                  <p><strong>Hora:</strong> {horaSeleccionada} {horaLocal && `(${horaLocal} tu hora)`}</p>
                  <p><strong>Duración:</strong> {configuracion?.duracionSesion || 60} minutos</p>
                  <p><strong>Modalidades disponibles:</strong> {modalidadesDisponibles.map(m => getModalidadEmoji(m) + ' ' + getModalidadTexto(m)).join(', ')}</p>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="modalidad">Modalidad de la sesión: *</label>
              <select
                id="modalidad"
                value={modalidadSeleccionada}
                onChange={(e) => setModalidadSeleccionada(e.target.value as Modalidad)}
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

            <div className="form-group">
              <label htmlFor="especialidad">Especialidad a tratar: *</label>
              <select
                id="especialidad"
                value={especialidadSeleccionada}
                onChange={(e) => setEspecialidadSeleccionada(e.target.value)}
                required
              >
                <option value="">Selecciona una especialidad</option>
                {psicologo.especialidades.map(especialidad => (
                  <option key={especialidad} value={especialidad}>{especialidad}</option>
                ))}
              </select>
            </div>

            <div className="datos-personales">
              <h4>Datos Personales</h4>
              
              <div className="form-group">
                <label htmlFor="nombre">Nombre completo: *</label>
                <input
                  type="text"
                  id="nombre"
                  value={datosPersonales.nombre}
                  onChange={(e) => setDatosPersonales({...datosPersonales, nombre: e.target.value})}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo electrónico: *</label>
                <input
                  type="email"
                  id="email"
                  value={datosPersonales.email}
                  onChange={(e) => setDatosPersonales({...datosPersonales, email: e.target.value})}
                  placeholder="tu@correo.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono (opcional):</label>
                <input
                  type="tel"
                  id="telefono"
                  value={datosPersonales.telefono}
                  onChange={(e) => setDatosPersonales({...datosPersonales, telefono: e.target.value})}
                  placeholder="+52 555 123 4567"
                />
              </div>
            </div>

            {errorAgendamiento && (
              <div className="error-message">
                ❌ {errorAgendamiento}
              </div>
            )}

            <div className="resumen-agendamiento">
              <h4>Resumen de la Cita</h4>
              <div className="resumen-detalles">
                <p><strong>Psicólogo:</strong> {psicologo.nombre} {psicologo.apellido}</p>
                <p><strong>Precio:</strong> ${psicologo.precio} por sesión</p>
                {fechaSeleccionada && <p><strong>Fecha:</strong> {new Date(fechaSeleccionada).toLocaleDateString('es-ES')}</p>}
                {horaSeleccionada && <p><strong>Hora:</strong> {horaSeleccionada}</p>}
                {modalidadSeleccionada && <p><strong>Modalidad:</strong> {getModalidadTexto(modalidadSeleccionada)}</p>}
                {especialidadSeleccionada && <p><strong>Especialidad:</strong> {especialidadSeleccionada}</p>}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => setVistaCalendario(true)}
                className="btn-secondary"
                disabled={agendando}
              >
                ← Cambiar Horario
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={agendando || !fechaSeleccionada || !horaSeleccionada || !modalidadSeleccionada || !especialidadSeleccionada || !datosPersonales.nombre || !datosPersonales.email}
              >
                {agendando ? 'Agendando...' : 'Confirmar Cita'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}; 