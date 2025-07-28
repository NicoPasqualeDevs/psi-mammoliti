import React from 'react';
import { Sesion, Psicologo } from '../types';

interface SesionesAgendadasProps {
  sesiones: Sesion[];
  psicologos: Psicologo[];
}

const getModalidadEmoji = (modalidad: string): string => {
  return modalidad === 'online' ? '💻' : '🏢';
};

const getModalidadTexto = (modalidad: string): string => {
  return modalidad === 'online' ? 'Online' : 'Presencial';
};

export const SesionesAgendadas: React.FC<SesionesAgendadasProps> = ({ sesiones, psicologos }) => {
  if (sesiones.length === 0) {
    return (
      <div className="sesiones-agendadas">
        <h3>Mis Sesiones Agendadas</h3>
        <p className="sin-sesiones">No tienes sesiones agendadas aún.</p>
      </div>
    );
  }

  return (
    <div className="sesiones-agendadas">
      <h3>Mis Sesiones Agendadas ({sesiones.length})</h3>
      
      <div className="lista-sesiones">
        {sesiones.map(sesion => {
          const psicologo = psicologos.find(p => p.id === sesion.psicologoId);
          
          return (
            <div key={sesion.id} className="sesion-card">
              <div className="sesion-header">
                <h4>{psicologo?.nombre} {psicologo?.apellido}</h4>
                <span className={`estado estado-${sesion.estado}`}>
                  {sesion.estado}
                </span>
              </div>
              
              <div className="sesion-detalles">
                <p><strong>Fecha:</strong> {new Date(sesion.fecha).toLocaleDateString('es-ES')}</p>
                <p><strong>Hora:</strong> {sesion.hora}</p>
                <p><strong>Modalidad:</strong> {getModalidadEmoji(sesion.modalidad)} {getModalidadTexto(sesion.modalidad)}</p>
                <p><strong>Especialidad:</strong> {sesion.especialidad}</p>
                <p><strong>Precio:</strong> ${psicologo?.precio}</p>
              </div>
              
              <div className="sesion-paciente">
                <p><strong>Paciente:</strong> {sesion.paciente?.nombre || 'Sin datos'}</p>
                <p><strong>Email:</strong> {sesion.paciente?.email || 'Sin datos'}</p>
                {sesion.paciente?.telefono && (
                  <p><strong>Teléfono:</strong> {sesion.paciente.telefono}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 