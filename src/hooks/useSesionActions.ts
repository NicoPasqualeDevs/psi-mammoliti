import { useState, useCallback } from 'react';
import { Sesion } from '../types';
import { getApiBaseUrl } from '../utils/apiConfig';

interface UseSesionActionsReturn {
  cancelando: boolean;
  reprogramando: boolean;
  error: string | null;
  cancelarSesion: (sesionId: string) => Promise<boolean>;
  reprogramarSesion: (sesionId: string, nuevaFecha: string, nuevaHora: string) => Promise<boolean>;
  limpiarError: () => void;
}

export function useSesionActions(): UseSesionActionsReturn {
  const [cancelando, setCancelando] = useState(false);
  const [reprogramando, setReprogramando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  const cancelarSesion = useCallback(async (sesionId: string): Promise<boolean> => {
    setCancelando(true);
    setError(null);

    try {
      // Actualizar estado de la sesión a 'cancelada'
      const sesionResponse = await fetch(`${getApiBaseUrl()}/sesiones/${sesionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'cancelada'
        })
      });

      if (!sesionResponse.ok) {
        throw new Error('Error al cancelar la sesión');
      }

      // Cancelar también la cita correspondiente
      try {
        const citaResponse = await fetch(`${getApiBaseUrl()}/citas/sesion/${sesionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            estado: 'cancelada'
          })
        });

        // No es crítico si falla la actualización de la cita
        if (!citaResponse.ok) {
          console.warn('No se pudo actualizar el estado de la cita asociada');
        }
      } catch (citaError) {
        console.warn('Error al actualizar cita:', citaError);
      }

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cancelar la sesión';
      setError(errorMessage);
      console.error('Error cancelando sesión:', err);
      return false;
    } finally {
      setCancelando(false);
    }
  }, []);

  const reprogramarSesion = useCallback(async (
    sesionId: string, 
    nuevaFecha: string, 
    nuevaHora: string
  ): Promise<boolean> => {
    setReprogramando(true);
    setError(null);

    try {
      // Primero obtener los datos actuales de la sesión
      const sesionActualResponse = await fetch(`${getApiBaseUrl()}/sesiones/${sesionId}`);
      if (!sesionActualResponse.ok) {
        throw new Error('Error al obtener datos de la sesión');
      }
      
      const sesionActual: Sesion = await sesionActualResponse.json();

      // Calcular hora de fin basada en duración estándar (60 minutos)
      const [horas, minutos] = nuevaHora.split(':').map(Number);
      const inicioMinutos = horas * 60 + minutos;
      const finMinutos = inicioMinutos + 60; // Duración estándar de 60 minutos
      
      const horaFinHoras = Math.floor(finMinutos / 60);
      const horaFinMinutos = finMinutos % 60;
      const nuevaHoraFin = `${horaFinHoras.toString().padStart(2, '0')}:${horaFinMinutos.toString().padStart(2, '0')}`;

      // Cancelar la cita anterior
      try {
        await fetch(`${getApiBaseUrl()}/citas/sesion/${sesionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            estado: 'cancelada'
          })
        });
      } catch (citaError) {
        console.warn('Error al cancelar cita anterior:', citaError);
      }

      // Actualizar la sesión con nueva fecha y hora
      const actualizarSesionResponse = await fetch(`${getApiBaseUrl()}/sesiones/${sesionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fecha: nuevaFecha,
          hora: nuevaHora,
          estado: 'confirmada' // Volver a confirmar la sesión reprogramada
        })
      });

      if (!actualizarSesionResponse.ok) {
        throw new Error('Error al actualizar la sesión');
      }

      // Crear nueva cita para bloquear el horario
      try {
        await fetch(`${getApiBaseUrl()}/citas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            psicologoId: sesionActual.psicologoId,
            fecha: nuevaFecha,
            hora_inicio: nuevaHora,
            hora_fin: nuevaHoraFin,
            modalidad: sesionActual.modalidad,
            sesionId: sesionId,
            estado: 'confirmada'
          })
        });
      } catch (citaError) {
        console.warn('Error al crear nueva cita:', citaError);
        // No es crítico, la sesión ya fue actualizada
      }

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al reprogramar la sesión';
      setError(errorMessage);
      console.error('Error reprogramando sesión:', err);
      return false;
    } finally {
      setReprogramando(false);
    }
  }, []);

  return {
    cancelando,
    reprogramando,
    error,
    cancelarSesion,
    reprogramarSesion,
    limpiarError
  };
}