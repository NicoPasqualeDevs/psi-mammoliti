import React, { useState, useMemo } from 'react';
import { Psicologo, CalendarioSemana, CalendarioDia, CalendarioHorario } from '../types';
import { detectarTimezone, convertirHorario, obtenerSemanaActual } from '../utils/timezone';

interface CalendarioDisponibilidadProps {
  psicologo: Psicologo;
  onSeleccionarHorario: (fecha: string, hora: string, horaLocal: string, modalidades: string[]) => void;
  fechaSeleccionada?: string;
  horaSeleccionada?: string;
}

const getModalidadEmoji = (modalidad: string): string => {
  return modalidad === 'online' ? '💻' : '🏢';
};

export const CalendarioDisponibilidad: React.FC<CalendarioDisponibilidadProps> = ({
  psicologo,
  onSeleccionarHorario,
  fechaSeleccionada,
  horaSeleccionada
}) => {
  const [semanaActual, setSemanaActual] = useState(() => obtenerSemanaActual());
  const [diasExpandidos, setDiasExpandidos] = useState<Set<string>>(new Set());
  const timezoneUsuario = detectarTimezone();
  const timezonePsicologo = 'America/Mexico_City';

  const calendarioSemana: CalendarioSemana = useMemo(() => {
    const dias: CalendarioDia[] = [];
    
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(semanaActual.inicio);
      fecha.setDate(semanaActual.inicio.getDate() + i);
      
      const fechaStr = fecha.toISOString().split('T')[0];
      const disponibilidadDia = psicologo.disponibilidad.find(d => d.fecha === fechaStr);
      
      const horarios: CalendarioHorario[] = disponibilidadDia?.horarios.map(horarioData => ({
        hora: horarioData.hora,
        disponible: true,
        horaLocal: convertirHorario(horarioData.hora, timezonePsicologo, timezoneUsuario),
        modalidades: horarioData.modalidades
      })) || [];
      
      dias.push({
        fecha,
        horarios
      });
    }
    
    return {
      inicio: semanaActual.inicio,
      fin: semanaActual.fin,
      dias
    };
  }, [psicologo.disponibilidad, semanaActual, timezoneUsuario]);

  const cambiarSemana = (direccion: 'anterior' | 'siguiente') => {
    const nuevaFecha = new Date(semanaActual.inicio);
    nuevaFecha.setDate(nuevaFecha.getDate() + (direccion === 'siguiente' ? 7 : -7));
    
    const nuevaSemana = {
      inicio: nuevaFecha,
      fin: new Date(nuevaFecha.getTime() + 6 * 24 * 60 * 60 * 1000)
    };
    
    setSemanaActual(nuevaSemana);
  };

  const esHoy = (fecha: Date): boolean => {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  };

  const esPasado = (fecha: Date): boolean => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fecha < hoy;
  };

  const toggleDiaExpandido = (fechaStr: string, tieneHorarios: boolean) => {
    if (!tieneHorarios) return;
    
    setDiasExpandidos(prev => {
      const nuevoSet = new Set(prev);
      if (nuevoSet.has(fechaStr)) {
        nuevoSet.delete(fechaStr);
      } else {
        nuevoSet.add(fechaStr);
      }
      return nuevoSet;
    });
  };

  return (
    <div className="calendario-disponibilidad">
      <div className="calendario-header">
        <button 
          className="btn-navegacion"
          onClick={() => cambiarSemana('anterior')}
        >
          ← Semana anterior
        </button>
        <h3>
          {semanaActual.inicio.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </h3>
        <button 
          className="btn-navegacion"
          onClick={() => cambiarSemana('siguiente')}
        >
          Semana siguiente →
        </button>
      </div>

      <div className="timezone-info">
        <p>
          <strong>Tu zona horaria:</strong> {timezoneUsuario}
          <br />
          <small>Los horarios se muestran adaptados a tu ubicación</small>
        </p>
      </div>

      <div className="calendario-grid">
        {calendarioSemana.dias.map((dia, index) => {
          const fechaStr = dia.fecha.toISOString().split('T')[0];
          const tieneHorarios = dia.horarios.length > 0;
          const esDiaPasado = esPasado(dia.fecha);
          const estaExpandido = diasExpandidos.has(fechaStr);
          
          return (
            <div 
              key={index} 
              className={`calendario-dia ${esHoy(dia.fecha) ? 'es-hoy' : ''} ${esDiaPasado ? 'es-pasado' : ''} ${estaExpandido ? 'expandido' : 'colapsado'} ${tieneHorarios && !esDiaPasado ? 'clickeable' : ''}`}
            >
              <div 
                className="dia-header"
                onClick={() => toggleDiaExpandido(fechaStr, tieneHorarios && !esDiaPasado)}
              >
                <span className="dia-nombre">
                  {dia.fecha.toLocaleDateString('es-ES', { weekday: 'short' })}
                </span>
                <span className="dia-numero">
                  {dia.fecha.getDate()}
                </span>
                {tieneHorarios && !esDiaPasado && (
                  <span className="indicador-expandir">
                    {estaExpandido ? '▼' : '▶'}
                  </span>
                )}
                {tieneHorarios && !esDiaPasado && (
                  <span className="contador-horarios">
                    {dia.horarios.length}
                  </span>
                )}
              </div>
              
              <div className="horarios-dia">
                {!tieneHorarios && !esDiaPasado && !estaExpandido && (
                  <div className="sin-horarios-colapsado">Sin disponibilidad</div>
                )}
                
                {esDiaPasado && !estaExpandido && (
                  <div className="dia-pasado-colapsado">Fecha pasada</div>
                )}
                
                {estaExpandido && (
                  <>
                    {!tieneHorarios && !esDiaPasado && (
                      <div className="sin-horarios">Sin disponibilidad</div>
                    )}
                    
                    {esDiaPasado && (
                      <div className="dia-pasado">Fecha pasada</div>
                    )}
                    
                    {tieneHorarios && !esDiaPasado && dia.horarios.map((horario, horarioIndex) => {
                      const isSelected = fechaSeleccionada === fechaStr && horaSeleccionada === horario.hora;
                      const modalidadesIconos = horario.modalidades.map(getModalidadEmoji).join(' ');
                      
                      return (
                        <button
                          key={horarioIndex}
                          className={`horario-slot ${isSelected ? 'seleccionado' : ''}`}
                          onClick={() => onSeleccionarHorario(fechaStr, horario.hora, horario.horaLocal, horario.modalidades)}
                        >
                          <div className="horario-info">
                            <div className="horario-original">{horario.hora}</div>
                            <div className="horario-local">({horario.horaLocal})</div>
                          </div>
                          <div className="modalidades-horario">
                            {modalidadesIconos}
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="leyenda-calendario">
        <div className="leyenda-item">
          <div className="color-disponible"></div>
          <span>Disponible</span>
        </div>
        <div className="leyenda-item">
          <div className="color-seleccionado"></div>
          <span>Seleccionado</span>
        </div>
        <div className="leyenda-item">
          <div className="color-no-disponible"></div>
          <span>No disponible</span>
        </div>
        <div className="leyenda-item">
          <span>💻 Online | 🏢 Presencial</span>
        </div>
      </div>
    </div>
  );
}; 