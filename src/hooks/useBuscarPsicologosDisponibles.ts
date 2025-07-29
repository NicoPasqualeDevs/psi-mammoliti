import { useState, useCallback } from 'react';
import { Psicologo, Modalidad } from '../types';
import { getApiBaseUrl } from '../utils/apiConfig';

interface PsicologoDisponible extends Psicologo {
  disponibilidadEncontrada: {
    fecha: string;
    hora: string;
    modalidad?: string;
    duracionSesion: number;
    tiempoBuffer: number;
  };
}

interface RespuestaBusqueda {
  fecha: string;
  hora: string;
  modalidadSolicitada?: string;
  cantidadDisponibles: number;
  psicologosDisponibles: PsicologoDisponible[];
}

interface UseBuscarPsicologosDisponiblesReturn {
  psicologosDisponibles: PsicologoDisponible[];
  cargando: boolean;
  error: string | null;
  ultimaBusqueda: {
    fecha: string;
    hora: string;
    modalidad?: string;
  } | null;
  cantidadDisponibles: number;
  buscarPsicologos: (fecha: string, hora: string, modalidad?: Modalidad) => Promise<void>;
  limpiarResultados: () => void;
}

export function useBuscarPsicologosDisponibles(): UseBuscarPsicologosDisponiblesReturn {
  const [psicologosDisponibles, setPsicologosDisponibles] = useState<PsicologoDisponible[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimaBusqueda, setUltimaBusqueda] = useState<{
    fecha: string;
    hora: string;
    modalidad?: string;
  } | null>(null);
  const [cantidadDisponibles, setCantidadDisponibles] = useState(0);

  const buscarPsicologos = useCallback(async (fecha: string, hora: string, modalidad?: Modalidad) => {
    setCargando(true);
    setError(null);
    
    try {
      // Validar formato de fecha
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(fecha)) {
        throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
      }

      // Validar formato de hora
      const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!horaRegex.test(hora)) {
        throw new Error('Formato de hora inválido. Use HH:MM');
      }

      // Construir URL con parámetros
      const params = new URLSearchParams({
        fecha,
        hora
      });
      
      if (modalidad) {
        params.append('modalidad', modalidad);
      }

      const response = await fetch(`${getApiBaseUrl()}/disponibilidad/buscar?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al buscar psicólogos disponibles');
      }

      const resultado: RespuestaBusqueda = await response.json();
      
      setPsicologosDisponibles(resultado.psicologosDisponibles);
      setCantidadDisponibles(resultado.cantidadDisponibles);
      setUltimaBusqueda({
        fecha: resultado.fecha,
        hora: resultado.hora,
        modalidad: resultado.modalidadSolicitada
      });

    } catch (err) {
      console.error('Error buscando psicólogos disponibles:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setPsicologosDisponibles([]);
      setCantidadDisponibles(0);
    } finally {
      setCargando(false);
    }
  }, []);

  const limpiarResultados = useCallback(() => {
    setPsicologosDisponibles([]);
    setCantidadDisponibles(0);
    setError(null);
    setUltimaBusqueda(null);
  }, []);

  return {
    psicologosDisponibles,
    cargando,
    error,
    ultimaBusqueda,
    cantidadDisponibles,
    buscarPsicologos,
    limpiarResultados
  };
}