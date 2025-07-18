import React from 'react';
import { Psicologo } from '../types';

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
        <p><strong>Próxima disponibilidad:</strong></p>
        <p>{proximaDisponibilidad.fecha} - {proximaDisponibilidad.horarios.length} horarios</p>
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