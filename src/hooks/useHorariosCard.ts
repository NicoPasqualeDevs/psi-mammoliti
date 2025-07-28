import { useState, useEffect } from 'react';
import { HorarioDisponible } from '../types';

interface UseHorariosCardProps {
  psicologoId: string;
  habilitado?: boolean;
}

interface UseHorariosCardReturn {
  proximaDisponibilidad: HorarioDisponible | null;
  cargando: boolean;
  error: string | null;
}

const getApiBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }
  return '/api';
};

export function useHorariosCard({ 
  psicologoId, 
  habilitado = true 
}: UseHorariosCardProps): UseHorariosCardReturn {
  const [proximaDisponibilidad, setProximaDisponibilidad] = useState<HorarioDisponible | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!habilitado || !psicologoId) {
      setProximaDisponibilidad(null);
      setCargando(false);
      return;
    }

    const cargarHorarios = async () => {
      setCargando(true);
      setError(null);

      try {
        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setDate(fechaInicio.getDate() + 7); // Próxima semana

        const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
        const fechaFinStr = fechaFin.toISOString().split('T')[0];

        const response = await fetch(
          `${getApiBaseUrl()}/psicologos/${psicologoId}/disponibilidad?fecha_inicio=${fechaInicioStr}&fecha_fin=${fechaFinStr}`
        );

        if (!response.ok) {
          throw new Error('Error al obtener horarios disponibles');
        }

        const disponibilidad: HorarioDisponible[] = await response.json();
        
        // Encontrar la primera fecha con horarios disponibles
        const primeraFechaConHorarios = disponibilidad.find(dia => dia.horarios.length > 0);
        
        setProximaDisponibilidad(primeraFechaConHorarios || null);

      } catch (err) {
        console.error('Error cargando horarios para card:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setProximaDisponibilidad(null);
      } finally {
        setCargando(false);
      }
    };

    cargarHorarios();
  }, [psicologoId, habilitado]);

  return {
    proximaDisponibilidad,
    cargando,
    error
  };
} 