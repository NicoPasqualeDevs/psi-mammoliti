import React, { useState, useMemo } from 'react';
import { Psicologo, CalendarioSemana, CalendarioDia, CalendarioHorario } from '../types';
import { detectarTimezone, convertirHorario, obtenerSemanaActual, formatearFechaCorta } from '../utils/timezone';

interface CalendarioDisponibilidadProps {
  psicologo: Psicologo;
  onSeleccionarHorario: (fecha: string, hora: string, horaLocal: string) => void;
  fechaSeleccionada?: string;
  horaSeleccionada?: string;
}

export const CalendarioDisponibilidad: React.FC<CalendarioDisponibilidadProps> = ({
  psicologo,
  onSeleccionarHorario,
  fechaSeleccionada,
  horaSeleccionada
}) => {
  const [semanaActual, setSemanaActual] = useState(() => obtenerSemanaActual());
  const timezoneUsuario = detectarTimezone();
  const timezonePsicologo = 'America/Mexico_City'; // Asumimos que el psicólogo está en México

  const calendarioSemana: CalendarioSemana = useMemo(() => {
    const dias: CalendarioDia[] = [];
    
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(semanaActual.inicio);
      fecha.setDate(semanaActual.inicio.getDate() + i);
      
      const fechaStr = fecha.toISOString().split('T')[0];
      const disponibilidadDia = psicologo.disponibilidad.find(d => d.fecha === fechaStr);
      
      const horarios: CalendarioHorario[] = disponibilidadDia?.horarios.map(hora => ({
        hora,
        disponible: true,
        horaLocal: convertirHorario(hora, timezonePsicologo, timezoneUsuario)
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
          
          return (
            <div 
              key={index} 
              className={`calendario-dia ${esHoy(dia.fecha) ? 'es-hoy' : ''} ${esDiaPasado ? 'es-pasado' : ''}`}
            >
              <div className="dia-header">
                <span className="dia-nombre">
                  {dia.fecha.toLocaleDateString('es-ES', { weekday: 'short' })}
                </span>
                <span className="dia-numero">
                  {dia.fecha.getDate()}
                </span>
              </div>
              
              <div className="horarios-dia">
                {!tieneHorarios && !esDiaPasado && (
                  <div className="sin-horarios">Sin disponibilidad</div>
                )}
                
                {esDiaPasado && (
                  <div className="dia-pasado">Fecha pasada</div>
                )}
                
                {tieneHorarios && !esDiaPasado && dia.horarios.map((horario, horarioIndex) => {
                  const isSelected = fechaSeleccionada === fechaStr && horaSeleccionada === horario.hora;
                  
                  return (
                    <button
                      key={horarioIndex}
                      className={`horario-slot ${isSelected ? 'seleccionado' : ''}`}
                      onClick={() => onSeleccionarHorario(fechaStr, horario.hora, horario.horaLocal)}
                    >
                      <div className="horario-original">{horario.hora}</div>
                      <div className="horario-local">({horario.horaLocal})</div>
                    </button>
                  );
                })}
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
      </div>
    </div>
  );
}; 