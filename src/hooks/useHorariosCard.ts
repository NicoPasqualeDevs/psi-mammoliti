import { useState, useEffect, useCallback } from 'react';
import { HorarioDisponible } from '../types';
import { getApiBaseUrl } from '../utils/apiConfig';
import { obtenerAhoraArgentina, obtenerFechaArgentina, validarAnticipacionArgentina } from '../utils/timezone';

interface UseHorariosCardProps {
  psicologoId: string;
  habilitado?: boolean;
}

interface UseHorariosCardReturn {
  proximaDisponibilidad: HorarioDisponible | null;
  cargando: boolean;
  error: string | null;
}

export function useHorariosCard({ 
  psicologoId, 
  habilitado = true 
}: UseHorariosCardProps): UseHorariosCardReturn {
  const [proximaDisponibilidad, setProximaDisponibilidad] = useState<HorarioDisponible | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtrarHorariosPorAnticipacion = useCallback((disponibilidad: HorarioDisponible[]): HorarioDisponible[] => {
    return disponibilidad.map(dia => ({
      ...dia,
      horarios: dia.horarios.filter(horario => {
        return validarAnticipacionArgentina(dia.fecha, horario.hora);
      })
    })).filter(dia => dia.horarios.length > 0); // Solo días con horarios disponibles
  }, []);

  useEffect(() => {
    if (!habilitado || !psicologoId) {
      setProximaDisponibilidad(null);
      setCargando(false);
      return;
    }

    const cargarHorarios = async () => {
      if (!habilitado) return;
      
      setCargando(true);
      setError(null);
      
      try {
        // Obtener fechas de la próxima semana usando hora de Argentina
        const hoyArgentina = obtenerAhoraArgentina();
        const fechaInicioStr = obtenerFechaArgentina(hoyArgentina);
        
        const fechaLimite = new Date(hoyArgentina);
        fechaLimite.setDate(fechaLimite.getDate() + 7); // Una semana desde hoy
        const fechaFinStr = obtenerFechaArgentina(fechaLimite);

        const response = await fetch(
          `${getApiBaseUrl()}/psicologos/${psicologoId}/disponibilidad?fecha_inicio=${fechaInicioStr}&fecha_fin=${fechaFinStr}`
        );

        if (!response.ok) {
          throw new Error('Error al obtener horarios disponibles');
        }

        const disponibilidad: HorarioDisponible[] = await response.json();
        
        // Filtrar horarios que no cumplan con las 6 horas mínimas de anticipación
        const disponibilidadFiltrada = filtrarHorariosPorAnticipacion(disponibilidad);
        
        // Encontrar la primera fecha con horarios disponibles
        const primeraFechaConHorarios = disponibilidadFiltrada.find(dia => dia.horarios.length > 0);
        
        setProximaDisponibilidad(primeraFechaConHorarios || null);

      } catch (err) {
        console.error('Error cargando horarios para card:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setProximaDisponibilidad(null);
      } finally {
        setCargando(false);
      }
    };

    // Cargar horarios inmediatamente
    cargarHorarios();
  }, [psicologoId, habilitado, filtrarHorariosPorAnticipacion]);

  // Efecto separado para actualizar horarios cada 5 minutos
  useEffect(() => {
    if (!proximaDisponibilidad) return;

    const intervalo = setInterval(() => {
      const disponibilidadActualizada = filtrarHorariosPorAnticipacion([proximaDisponibilidad]);
      if (disponibilidadActualizada.length === 0) {
        setProximaDisponibilidad(null);
      } else {
        setProximaDisponibilidad(disponibilidadActualizada[0]);
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(intervalo);
  }, [proximaDisponibilidad, filtrarHorariosPorAnticipacion]);

  // Actualizar horarios automáticamente cada minuto para eliminar los que ya no son válidos
  useEffect(() => {
    if (!proximaDisponibilidad) return;
    
    const interval = setInterval(() => {
      const horariosFiltrados = filtrarHorariosPorAnticipacion([proximaDisponibilidad]);
      if (horariosFiltrados.length === 0) {
        // Si ya no hay horarios válidos, actualizar a null
        setProximaDisponibilidad(null);
      } else if (horariosFiltrados[0].horarios.length !== proximaDisponibilidad.horarios.length) {
        // Si cambió el número de horarios válidos, actualizar
        setProximaDisponibilidad(horariosFiltrados[0]);
      }
    }, 60000); // Cada minuto
    
    return () => clearInterval(interval);
  }, [proximaDisponibilidad, filtrarHorariosPorAnticipacion]);

  return {
    proximaDisponibilidad,
    cargando,
    error
  };
} 