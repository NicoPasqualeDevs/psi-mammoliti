import { useState, useEffect, useCallback } from 'react';
import { DisponibilidadRespuesta, ConfiguracionHorarios, HorarioDisponible } from '../types';
import { apiService } from '../services/apiService';

interface UseHorariosRealesProps {
  psicologoId: string;
  habilitado?: boolean;
}

interface UseHorariosRealesReturn {
  disponibilidad: HorarioDisponible[];
  configuracion: ConfiguracionHorarios | null;
  cargando: boolean;
  error: string | null;
  refrescar: () => Promise<void>;
}

export function useHorariosReales({ 
  psicologoId, 
  habilitado = true 
}: UseHorariosRealesProps): UseHorariosRealesReturn {
  
  const [disponibilidad, setDisponibilidad] = useState<HorarioDisponible[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionHorarios | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    if (!habilitado || !psicologoId) return;

    setCargando(true);
    setError(null);

    try {
      // Obtener rango de fechas (próximas 4 semanas)
      const { fechaInicio, fechaFin } = apiService.obtenerRangoFechasDisponibilidad();

      // Cargar datos en paralelo
      const [disponibilidadData, configuracionData] = await Promise.all([
        apiService.obtenerDisponibilidadReal(psicologoId, fechaInicio, fechaFin),
        apiService.obtenerConfiguracionHorarios(psicologoId)
      ]);

      // Convertir al formato legacy para compatibilidad
      const disponibilidadLegacy = apiService.convertirDisponibilidadALegacy(disponibilidadData);
      
      setDisponibilidad(disponibilidadLegacy);
      setConfiguracion(configuracionData);

    } catch (err) {
      console.error('Error cargando horarios reales:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      
      // Fallback: mantener disponibilidad vacía
      setDisponibilidad([]);
      setConfiguracion(null);
    } finally {
      setCargando(false);
    }
  }, [psicologoId, habilitado]);

  // Cargar datos cuando cambia el psicólogoId o habilitado
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const refrescar = useCallback(async () => {
    await cargarDatos();
  }, [cargarDatos]);

  return {
    disponibilidad,
    configuracion,
    cargando,
    error,
    refrescar
  };
}

// Hook para agendar citas
export function useAgendarCita() {
  const [agendando, setAgendando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agendarCita = useCallback(async (datos: {
    psicologoId: string;
    fecha: string;
    hora: string;
    modalidad: string;
    duracionMinutos: number;
    pacienteNombre: string;
    pacienteEmail: string;
    pacienteTelefono?: string;
    especialidad: string;
  }) => {
    setAgendando(true);
    setError(null);

    try {
      // Calcular hora de fin basada en duración
      const [horas, minutos] = datos.hora.split(':').map(Number);
      const inicioMinutos = horas * 60 + minutos;
      const finMinutos = inicioMinutos + datos.duracionMinutos;
      
      const horaFinHoras = Math.floor(finMinutos / 60);
      const horaFinMinutos = finMinutos % 60;
      const horaFin = `${horaFinHoras.toString().padStart(2, '0')}:${horaFinMinutos.toString().padStart(2, '0')}`;

      const resultado = await apiService.agendarCita({
        psicologoId: datos.psicologoId,
        fecha: datos.fecha,
        horaInicio: datos.hora,
        horaFin: horaFin,
        modalidad: datos.modalidad,
        pacienteNombre: datos.pacienteNombre,
        pacienteEmail: datos.pacienteEmail,
        pacienteTelefono: datos.pacienteTelefono,
        especialidad: datos.especialidad
      });

      return resultado;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al agendar cita';
      setError(errorMsg);
      throw err;
    } finally {
      setAgendando(false);
    }
  }, []);

  return {
    agendarCita,
    agendando,
    error
  };
} 