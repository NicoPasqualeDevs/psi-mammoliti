import React, { useState } from 'react';
import { Psicologo } from '../types';
import { detectarTimezone, convertirHorario } from '../utils/timezone';

interface PsicologoCardProps {
  psicologo: Psicologo;
  onSeleccionar: (psicologo: Psicologo) => void;
}

const LONGITUD_MAXIMA = 86; // Longitud del texto de ejemplo

const truncarTexto = (texto: string, expandido: boolean): string => {
  if (expandido || texto.length <= LONGITUD_MAXIMA) return texto;
  return texto.slice(0, LONGITUD_MAXIMA) + '...';
};

const getModalidadEmoji = (modalidad: string): string => {
  return modalidad === 'online' ? '💻' : '🏢';
};

const getModalidadTexto = (modalidad: string): string => {
  return modalidad === 'online' ? 'Online' : 'Presencial';
};

export const PsicologoCard: React.FC<PsicologoCardProps> = ({ psicologo, onSeleccionar }) => {
  const [expandido, setExpandido] = useState(false);
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
          <p className={`experiencia ${expandido ? 'expandido' : ''}`}>
            {psicologo.experiencia} años de experiencia
          </p>
          <p className={`descripcion ${expandido ? 'expandido' : ''}`}>
            {truncarTexto(psicologo.descripcion, expandido)}
          </p>
          {psicologo.descripcion.length > LONGITUD_MAXIMA && (
            <button 
              className="btn-expandir"
              onClick={() => setExpandido(!expandido)}
            >
              {expandido ? '▼ Ver menos' : '▲ Ver más'}
            </button>
          )}
        </div>
      </div>
      
      <div className="especialidades">
        {psicologo.especialidades.map((esp, index) => (
          <span key={index} className="especialidad-tag">{esp}</span>
        ))}
      </div>
      
      <div className="modalidades-disponibles">
        <p><strong>Modalidades disponibles:</strong></p>
        <div className="modalidades-lista">
          {psicologo.modalidades.map((modalidad, index) => (
            <span key={index} className="modalidad-tag">
              {getModalidadEmoji(modalidad)} {getModalidadTexto(modalidad)}
            </span>
          ))}
        </div>
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
              {proximaDisponibilidad.horarios.slice(0, 3).map((horarioData, index) => {
                const horaLocal = convertirHorario(horarioData.hora, timezonePsicologo, timezoneUsuario);
                const modalidadesTexto = horarioData.modalidades.map(getModalidadEmoji).join('');
                return (
                  <span key={index} className="horario-preview">
                    {modalidadesTexto} {horarioData.hora} ({horaLocal})
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