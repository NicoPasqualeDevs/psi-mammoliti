import React, { useState, useEffect } from 'react';
import { Psicologo } from '../types';
import { detectarTimezone, convertirHorario } from '../utils/timezone';
import { useHorariosCard } from '../hooks/useHorariosCard';

interface PsicologoCardProps {
  psicologo: Psicologo;
  onSeleccionar: (psicologo: Psicologo) => void;
  onSeleccionarHorario: (psicologo: Psicologo, fecha: string, hora: string, modalidades: string[]) => void;
  index?: number;
}

const LONGITUD_MAXIMA = 86;

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

export const PsicologoCard: React.FC<PsicologoCardProps> = ({ 
  psicologo, 
  onSeleccionar, 
  onSeleccionarHorario,
  index = 0
}) => {
  const [expandido, setExpandido] = useState(false);
  const [visible, setVisible] = useState(false);
  const [horariosEstables, setHorariosEstables] = useState<any>(null);
  const timezoneUsuario = detectarTimezone();
  const timezonePsicologo = 'America/Mexico_City';

  // Cargar horarios disponibles
  const { proximaDisponibilidad: horarioReal, cargando: cargandoHorarios } = useHorariosCard({
    psicologoId: psicologo.id,
    habilitado: psicologo.tieneHorariosConfigurados || false
  });

  // Determinar qué horarios mostrar
  const tieneHorarios = psicologo.tieneHorariosConfigurados || false;
  const proximaDisponibilidad = tieneHorarios && horarioReal 
    ? horarioReal 
    : psicologo.disponibilidad[0];

  // Manejar animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, index * 100);

    return () => clearTimeout(timer);
  }, [index]);

  // Mantener horarios estables para evitar parpadeo
  useEffect(() => {
    if (proximaDisponibilidad && !cargandoHorarios) {
      setHorariosEstables(proximaDisponibilidad);
    } else if (!tieneHorarios && psicologo.disponibilidad[0]) {
      setHorariosEstables(psicologo.disponibilidad[0]);
    }
  }, [proximaDisponibilidad, cargandoHorarios, tieneHorarios, psicologo.disponibilidad]);

  const handleClickHorario = (fecha: string, hora: string, modalidades: string[]) => {
    onSeleccionarHorario(psicologo, fecha, hora, modalidades);
  };

  const horariosMostrar = horariosEstables || proximaDisponibilidad;

  return (
    <div className={`psicologo-card ${visible ? 'card-visible' : 'card-hidden'}`}>
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
        </div>
      </div>
      
      <div className="psicologo-detalles">
        <p className={`experiencia ${expandido ? 'expandido' : ''}`}>
          {psicologo.experiencia} años de experiencia
        </p>
        <p className={`descripcion ${expandido ? 'expandido' : ''}`}>
          {truncarTexto(psicologo.descripcion, expandido)}
        </p>
        {psicologo.descripcion.length > LONGITUD_MAXIMA && (
          <button 
            className="btn-expandir btn-expandir-sutil"
            onClick={() => setExpandido(!expandido)}
          >
            {expandido ? 'ver menos' : 'leer más...'}
          </button>
        )}
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
          <span className={`estado-horarios ${tieneHorarios ? 'con-horarios' : 'sin-horarios'}`}>
            {tieneHorarios ? '✅ Horarios disponibles' : '❌ Sin horarios'}
          </span>
        </div>
        
        <div className={`horarios-content ${cargandoHorarios && tieneHorarios ? 'cargando' : 'cargado'}`}>
          {cargandoHorarios && tieneHorarios && (
            <div className="cargando-horarios">
              <small>🔄 Cargando horarios disponibles...</small>
            </div>
          )}

          {horariosMostrar && (
            <div className="proxima-cita">
              <p className="fecha-proxima">
                <strong>Próxima fecha:</strong> {new Date(horariosMostrar.fecha).toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </p>
              <div className="horarios-preview">
                <small className="horarios-hint">👆 Haz click en un horario para agendar directamente:</small>
                <div className="horarios-container">
                  {horariosMostrar.horarios?.slice(0, 3).map((horarioData: any, index: number) => {
                    const horaLocal = convertirHorario(horarioData.hora, timezonePsicologo, timezoneUsuario);
                    const modalidadesTexto = horarioData.modalidades.map(getModalidadEmoji).join('');
                    return (
                      <button
                        key={index} 
                        className="horario-preview horario-clickeable"
                        onClick={() => handleClickHorario(horariosMostrar.fecha, horarioData.hora, horarioData.modalidades)}
                        title={`Hacer click para agendar directamente en ${horarioData.hora}`}
                      >
                        {modalidadesTexto} {horarioData.hora} ({horaLocal})
                      </button>
                    );
                  })}
                  {horariosMostrar.horarios?.length > 3 && (
                    <span className="mas-horarios">+{horariosMostrar.horarios.length - 3} más</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {!horariosMostrar && !cargandoHorarios && tieneHorarios && (
            <div className="sin-horarios-disponibles">
              <p><small>⚠️ No hay horarios disponibles en los próximos 7 días</small></p>
            </div>
          )}

          {!tieneHorarios && (
            <div className="sin-configuracion">
              <p><small>⚠️ Este psicólogo aún no ha configurado sus horarios de trabajo</small></p>
            </div>
          )}
        </div>
        
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
          Ver Todos los Horarios
        </button>
      </div>
    </div>
  );
}; 