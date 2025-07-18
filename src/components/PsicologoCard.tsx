import React from 'react';
import { Psicologo } from '../types';
import { detectarTimezone, convertirHorario } from '../utils/timezone';

interface PsicologoCardProps {
  psicologo: Psicologo;
  onSeleccionar: (psicologo: Psicologo) => void;
}

const LONGITUD_MAXIMA = 86; // Longitud del texto de ejemplo

const truncarTexto = (texto: string): string => {
  if (texto.length <= LONGITUD_MAXIMA) return texto;
  return texto.slice(0, LONGITUD_MAXIMA) + '...';
};

export const PsicologoCard: React.FC<PsicologoCardProps> = ({ psicologo, onSeleccionar }) => {
  const proximaDisponibilidad = psicologo.disponibilidad[0];
  const timezoneUsuario = detectarTimezone();
  const timezonePsicologo = 'America/Mexico_City';

  const totalHorarios = psicologo.disponibilidad.reduce((total, dia) => total + dia.horarios.length, 0);

  return (
    <div className="psicologo-card">
      <div className="psicologo-header">
        <img 
          src={psicologo.imagen} 
          alt={`${psicologo.nombre} ${psicologo.apellido}`}
          className="psicologo-imagen"
        />
        <div className="psicologo-info">
          <h3>{psicologo.nombre} {psicologo.apellido}</h3>
          <div className="rating">
            <span className="estrellas">{'★'.repeat(Math.floor(psicologo.rating))}</span>
            <span className="rating-numero">({psicologo.rating})</span>
          </div>
          <p className="experiencia">{psicologo.experiencia} años de experiencia</p>
        </div>
      </div>
      
      <p className="descripcion">{truncarTexto(psicologo.descripcion)}</p>
      
      <div className="especialidades">
        {psicologo.especialidades.map((esp, index) => (
          <span key={index} className="especialidad-tag">{esp}</span>
        ))}
      </div>
      
      <div className="disponibilidad-info">
        <div className="disponibilidad-header">
          <p><strong>Disponibilidad:</strong></p>
          <span className="total-horarios">{totalHorarios} horarios totales</span>
        </div>
        
        {proximaDisponibilidad && (
          <div className="proxima-cita">
            <p className="fecha-proxima">
              <strong>Próxima fecha:</strong> {new Date(proximaDisponibilidad.fecha).toLocaleDateString('es-ES', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}
            </p>
            <div className="horarios-preview">
              {proximaDisponibilidad.horarios.slice(0, 3).map((hora, index) => {
                const horaLocal = convertirHorario(hora, timezonePsicologo, timezoneUsuario);
                return (
                  <span key={index} className="horario-preview">
                    {hora} ({horaLocal})
                  </span>
                );
              })}
              {proximaDisponibilidad.horarios.length > 3 && (
                <span className="mas-horarios">+{proximaDisponibilidad.horarios.length - 3} más</span>
              )}
            </div>
          </div>
        )}
        
        <div className="timezone-nota">
          <small>Horarios mostrados en tu zona: {timezoneUsuario.split('/').pop()}</small>
        </div>
      </div>
      
      <div className="precio-accion">
        <span className="precio">${psicologo.precio}/sesión</span>
        <button 
          className="btn-agendar"
          onClick={() => onSeleccionar(psicologo)}
        >
          Ver Horarios
        </button>
      </div>
    </div>
  );
}; 