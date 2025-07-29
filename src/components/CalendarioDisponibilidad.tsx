import React, { useState, useMemo } from 'react';
import { Psicologo, CalendarioDiaData, CalendarioSemanaData, CalendarioHorario } from '../types';
import { useHorariosReales } from '../hooks/useHorariosReales';
import { obtenerSemanaActual, esHoyArgentina, esPasadoArgentina, validarAnticipacionArgentina, obtenerFechaArgentina } from '../utils/timezone';

interface CalendarioDisponibilidadProps {
  psicologo: Psicologo;
  onSeleccionarHorario: (fecha: string, hora: string, modalidades: string[]) => void;
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

  // Usar horarios reales del backend
  const { 
    disponibilidad: disponibilidadReal, 
    cargando: cargandoHorarios, 
    error: errorHorarios,
    refrescar 
  } = useHorariosReales({ 
    psicologoId: psicologo.id 
  });

  const calendarioSemana = useMemo(() => {
    const dias: CalendarioDiaData[] = []; 
    
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(semanaActual.inicio);
      fecha.setDate(semanaActual.inicio.getDate() + i);
      
      // Usar consistentemente la función de Argentina para todas las fechas
      const fechaStr = obtenerFechaArgentina(fecha);
      
      // Buscar disponibilidad en los horarios reales
      const disponibilidadDia = disponibilidadReal.find(d => d.fecha === fechaStr);
      
      const horarios: CalendarioHorario[] = disponibilidadDia?.horarios.map(horarioData => ({
        hora: horarioData.hora,
        disponible: true,
        horaLocal: horarioData.hora,
        modalidades: horarioData.modalidades
      })) || [];
      
      dias.push({
        fecha,
        fechaStr, // Guardar la fecha string consistente
        horarios
      });
    }
    
    return {
      inicio: semanaActual.inicio,
      fin: semanaActual.fin,
      dias
    };
  }, [semanaActual, disponibilidadReal]);

  const cambiarSemana = (direccion: 'anterior' | 'siguiente') => {
    const nuevaFecha = new Date(semanaActual.inicio);
    if (direccion === 'siguiente') {
      nuevaFecha.setDate(nuevaFecha.getDate() + 7);
    } else {
      nuevaFecha.setDate(nuevaFecha.getDate() - 7);
    }
    
    setSemanaActual({
      inicio: nuevaFecha,
      fin: new Date(nuevaFecha.getTime() + 6 * 24 * 60 * 60 * 1000)
    });
  };

  const esHoy = (fecha: Date): boolean => {
    return esHoyArgentina(fecha);
  };

  const esPasado = (fecha: Date): boolean => {
    return esPasadoArgentina(fecha);
  };

  const esHorarioPasado = (fecha: Date, hora: string): boolean => {
    const fechaStr = obtenerFechaArgentina(fecha);
    return !validarAnticipacionArgentina(fechaStr, hora);
  };

  const toggleDiaExpandido = (fechaStr: string, tieneHorarios: boolean) => {
    if (!tieneHorarios) return;
    
    const nuevosExpandidos = new Set(diasExpandidos);
    if (nuevosExpandidos.has(fechaStr)) {
      nuevosExpandidos.delete(fechaStr);
    } else {
      nuevosExpandidos.add(fechaStr);
    }
    setDiasExpandidos(nuevosExpandidos);
  };

  const formatearHorario = (hora: string): string => {
    return hora;
  };

  // Mostrar estado de carga
  if (cargandoHorarios) {
    return (
      <div className="calendario-loading">
        <div className="loading-spinner"></div>
        <p>Cargando horarios disponibles...</p>
      </div>
    );
  }

  // Mostrar error con opción de reintentar
  if (errorHorarios) {
    return (
      <div className="calendario-error">
        <p>❌ Error al cargar horarios: {errorHorarios}</p>
        <button onClick={refrescar} className="btn-secondary">
          🔄 Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="calendario-disponibilidad">
      <div className="calendario-header">
        <button 
          onClick={() => cambiarSemana('anterior')}
          className="btn-navegacion"
          aria-label="Semana anterior"
        >
          ←
        </button>
        <h3>
          {semanaActual.inicio.toLocaleDateString('es-ES', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </h3>
        <button 
          onClick={() => cambiarSemana('siguiente')}
          className="btn-navegacion"
          aria-label="Semana siguiente"
        >
          →
        </button>
      </div>

      <div className="info-timezone">
        ℹ️ Todos los horarios están en hora de Buenos Aires, Argentina
      </div>

      <div className="calendario-grid">
        {calendarioSemana.dias.map((dia) => {
          // Usar la fecha string consistente que ya calculamos
          const fechaStr = dia.fechaStr;
          const tieneHorarios = dia.horarios.length > 0;
          const esExpandido = diasExpandidos.has(fechaStr);
          const esDiaActual = esHoy(dia.fecha);
          const esDiaPasado = esPasado(dia.fecha);

          return (
            <div 
              key={fechaStr} 
              className={`calendario-dia ${esDiaActual ? 'hoy' : ''} ${esDiaPasado ? 'pasado' : ''} ${!tieneHorarios ? 'sin-horarios' : ''} ${esExpandido ? 'expandido' : 'colapsado'}`}
            >
              <div 
                className="dia-header"
                onClick={() => toggleDiaExpandido(fechaStr, tieneHorarios)}
                style={{ cursor: tieneHorarios ? 'pointer' : 'default' }}
              >
                <div className="dia-info">
                  <span className="dia-nombre">
                    {dia.fecha.toLocaleDateString('es-ES', { weekday: 'short' })}
                  </span>
                  <span className="dia-numero">
                    {dia.fecha.getDate()}
                  </span>
                  {esDiaActual && <span className="hoy-badge">Hoy</span>}
                </div>
                <div className="dia-stats">
                  {tieneHorarios ? (
                    <>
                      <span className="horarios-disponibles">✅ Disponible</span>
                      <span className={`expand-icon ${esExpandido ? 'expanded' : ''}`}>▼</span>
                    </>
                  ) : (
                    <span className="sin-disponibilidad">❌ Sin horarios</span>
                  )}
                </div>
              </div>

              {tieneHorarios && esExpandido && (
                <div className="horarios-lista">
                  {dia.horarios.map((horario: CalendarioHorario) => {
                    const esSeleccionado = fechaSeleccionada === fechaStr && horaSeleccionada === horario.hora;
                    const horarioPasado = esHorarioPasado(dia.fecha, horario.hora);
                    
                    return (
                      <button
                        key={horario.hora}
                        className={`horario-slot ${esSeleccionado ? 'seleccionado' : ''} ${horarioPasado ? 'pasado' : ''}`}
                        onClick={() => onSeleccionarHorario(
                          fechaStr, 
                          horario.hora, 
                          horario.modalidades
                        )}
                        disabled={!horario.disponible || horarioPasado}
                        title={horarioPasado ? 'Este horario requiere al menos 6 horas de anticipación' : ''}
                      >
                        <div className="horario-info">
                          <span className="horario-tiempo">
                            {formatearHorario(horario.hora)}
                          </span>
                          <div className="modalidades">
                            {horario.modalidades.map((modalidad: string) => (
                              <span key={modalidad} className="modalidad-badge">
                                {getModalidadEmoji(modalidad)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mensaje si no hay horarios en toda la semana */}
      {calendarioSemana.dias.every(dia => dia.horarios.length === 0) && (
        <div className="semana-sin-horarios">
          <p>No hay horarios disponibles esta semana</p>
          <button onClick={refrescar} className="btn-secondary">
            🔄 Actualizar
          </button>
        </div>
      )}
    </div>
  );
}; 