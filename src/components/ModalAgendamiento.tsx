import React, { useState } from 'react';
import { Psicologo, Sesion } from '../types';

interface ModalAgendamientoProps {
  psicologo: Psicologo | null;
  onCerrar: () => void;
  onAgendar: (sesion: Omit<Sesion, 'id' | 'estado'>) => void;
}

export const ModalAgendamiento: React.FC<ModalAgendamientoProps> = ({
  psicologo,
  onCerrar,
  onAgendar
}) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
  const [datosPersonales, setDatosPersonales] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });

  if (!psicologo) return null;

  const horiosDisponibles = psicologo.disponibilidad.find(
    d => d.fecha === fechaSeleccionada
  )?.horarios || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fechaSeleccionada || !horaSeleccionada || !especialidadSeleccionada || 
        !datosPersonales.nombre || !datosPersonales.email) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    onAgendar({
      psicologoId: psicologo.id,
      fecha: fechaSeleccionada,
      hora: horaSeleccionada,
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

        <form onSubmit={handleSubmit} className="formulario-agendamiento">
          <div className="campo-grupo">
            <label>Fecha de la sesión:</label>
            <select 
              value={fechaSeleccionada} 
              onChange={e => setFechaSeleccionada(e.target.value)}
              required
            >
              <option value="">Selecciona una fecha</option>
              {psicologo.disponibilidad.map(disp => (
                <option key={disp.fecha} value={disp.fecha}>
                  {new Date(disp.fecha).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </option>
              ))}
            </select>
          </div>

          {fechaSeleccionada && (
            <div className="campo-grupo">
              <label>Hora:</label>
              <select 
                value={horaSeleccionada} 
                onChange={e => setHoraSeleccionada(e.target.value)}
                required
              >
                <option value="">Selecciona una hora</option>
                {horiosDisponibles.map(hora => (
                  <option key={hora} value={hora}>{hora}</option>
                ))}
              </select>
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
            {fechaSeleccionada && <p><strong>Fecha:</strong> {fechaSeleccionada}</p>}
            {horaSeleccionada && <p><strong>Hora:</strong> {horaSeleccionada}</p>}
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
        </form>
      </div>
    </div>
  );
}; 