import { useState, useEffect, useCallback } from 'react';
import { HorarioDisponible, ConfiguracionHorarios } from '../types';
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
      // Obtener rango de fechas (próximas 4 semanas desde hoy)
      const hoy = new Date();
      const fechaInicio = hoy.toISOString().split('T')[0];
      
      const fechaLimite = new Date(hoy);
      fechaLimite.setDate(fechaLimite.getDate() + 28); // 4 semanas
      const fechaFin = fechaLimite.toISOString().split('T')[0];

      // Configuración dinámica de URL base
      const getApiBaseUrl = () => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          return 'http://localhost:3001/api';
        }
        return '/api';
      };
      
      // Cargar disponibilidad directamente desde el backend simplificado
      const disponibilidadResponse = await fetch(
        `${getApiBaseUrl()}/psicologos/${psicologoId}/disponibilidad?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
      );

      if (!disponibilidadResponse.ok) {
        throw new Error('Error al obtener disponibilidad');
      }

      const disponibilidadData = await disponibilidadResponse.json();
      setDisponibilidad(disponibilidadData);

      // Cargar configuración
      try {
        const configResponse = await fetch(`${getApiBaseUrl()}/psicologos/${psicologoId}/configuracion-horarios`);
        if (configResponse.ok) {
          const configData = await configResponse.json();
          setConfiguracion({
            id: configData.id,
            psicologoId: configData.psicologoId,
            duracionSesion: configData.duracion_sesion,
            tiempoBuffer: configData.tiempo_buffer,
            diasAnticipacion: configData.dias_anticipacion || 30,
            zonaHoraria: configData.zona_horaria,
            autoGenerar: configData.auto_generar === 1
          });
        }
      } catch (configError) {
        console.warn('No se pudo cargar la configuración, usando valores por defecto');
        setConfiguracion(null);
      }

    } catch (err) {
      console.error('Error cargando horarios:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
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

// Hook para agendar citas (simplificado)
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

      // Configuración dinámica de URL base para agendamiento
      const getApiBaseUrl = () => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          return 'http://localhost:3001/api';
        }
        return '/api';
      };
      
      // Crear sesión
      const sesionResponse = await fetch(`${getApiBaseUrl()}/sesiones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          psicologoId: datos.psicologoId,
          fecha: datos.fecha,
          hora: datos.hora,
          modalidad: datos.modalidad,
          paciente: {
            nombre: datos.pacienteNombre,
            email: datos.pacienteEmail,
            telefono: datos.pacienteTelefono
          },
          especialidad: datos.especialidad
        })
      });

      if (!sesionResponse.ok) {
        throw new Error('Error al crear sesión');
      }

      const sesionData = await sesionResponse.json();

      // Crear cita para bloquear el horario
      const citaResponse = await fetch(`${getApiBaseUrl()}/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          psicologoId: datos.psicologoId,
          fecha: datos.fecha,
          hora_inicio: datos.hora,
          hora_fin: horaFin,
          modalidad: datos.modalidad,
          sesionId: sesionData.id
        })
      });

      if (!citaResponse.ok) {
        throw new Error('Error al crear cita');
      }

      return { sesionId: sesionData.id, citaId: (await citaResponse.json()).id };

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