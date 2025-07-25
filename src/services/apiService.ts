import { Psicologo, Sesion, HorarioTrabajo, HorarioExcepcion, ConfiguracionHorarios, DisponibilidadRespuesta } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {

  // === PSICÓLOGOS ===
  async obtenerPsicologos(): Promise<Psicologo[]> {
    const response = await fetch(`${API_BASE_URL}/psicologos`);
    if (!response.ok) {
      throw new Error('Error al obtener psicólogos');
    }
    return response.json();
  }

  async obtenerPsicologoPorId(id: string): Promise<Psicologo> {
    const response = await fetch(`${API_BASE_URL}/psicologos/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener psicólogo');
    }
    return response.json();
  }

  // === SESIONES ===
  async obtenerSesiones(): Promise<Sesion[]> {
    const response = await fetch(`${API_BASE_URL}/sesiones`);
    if (!response.ok) {
      throw new Error('Error al obtener sesiones');
    }
    return response.json();
  }

  async crearSesion(sesion: Omit<Sesion, 'id' | 'estado'>): Promise<Sesion> {
    const response = await fetch(`${API_BASE_URL}/sesiones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sesion),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear sesión');
    }
    
    return response.json();
  }

  // === HORARIOS REALES ===

  /**
   * Obtiene la disponibilidad real de un psicólogo para un rango de fechas
   */
  async obtenerDisponibilidadReal(
    psicologoId: string,
    fechaInicio: string,
    fechaFin: string
  ): Promise<DisponibilidadRespuesta[]> {
    const response = await fetch(
      `${API_BASE_URL}/psicologos/${psicologoId}/disponibilidad?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
    );
    
    if (!response.ok) {
      throw new Error('Error al obtener disponibilidad');
    }
    
    return response.json();
  }

  /**
   * Obtiene la configuración de horarios de un psicólogo
   */
  async obtenerConfiguracionHorarios(psicologoId: string): Promise<ConfiguracionHorarios> {
    const response = await fetch(`${API_BASE_URL}/psicologos/${psicologoId}/configuracion-horarios`);
    
    if (!response.ok) {
      throw new Error('Error al obtener configuración de horarios');
    }
    
    return response.json();
  }

  /**
   * Obtiene los horarios de trabajo semanales de un psicólogo
   */
  async obtenerHorariosTrabajo(psicologoId: string): Promise<HorarioTrabajo[]> {
    const response = await fetch(`${API_BASE_URL}/psicologos/${psicologoId}/horarios-trabajo`);
    
    if (!response.ok) {
      throw new Error('Error al obtener horarios de trabajo');
    }
    
    return response.json();
  }

  /**
   * Obtiene las excepciones de horarios de un psicólogo
   */
  async obtenerExcepciones(psicologoId: string): Promise<HorarioExcepcion[]> {
    const response = await fetch(`${API_BASE_URL}/psicologos/${psicologoId}/horarios-excepciones`);
    
    if (!response.ok) {
      throw new Error('Error al obtener excepciones');
    }
    
    return response.json();
  }

  /**
   * Agenda una cita real en el sistema
   */
  async agendarCita(datos: {
    psicologoId: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    modalidad: string;
    pacienteNombre: string;
    pacienteEmail: string;
    pacienteTelefono?: string;
    especialidad: string;
  }): Promise<{ citaId: string; sesionId: string }> {
    const response = await fetch(`${API_BASE_URL}/citas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al agendar cita');
    }
    
    return response.json();
  }

  // === UTILIDADES ===

  /**
   * Calcula el rango de fechas para mostrar disponibilidad (próximas 4 semanas)
   */
  obtenerRangoFechasDisponibilidad(): { fechaInicio: string; fechaFin: string } {
    const hoy = new Date();
    const fechaInicio = hoy.toISOString().split('T')[0];
    
    const fechaLimite = new Date(hoy);
    fechaLimite.setDate(fechaLimite.getDate() + 28); // 4 semanas
    const fechaFin = fechaLimite.toISOString().split('T')[0];
    
    return { fechaInicio, fechaFin };
  }

  /**
   * Convierte la disponibilidad del backend al formato legacy para compatibilidad
   */
  convertirDisponibilidadALegacy(
    disponibilidad: DisponibilidadRespuesta[]
  ): { fecha: string; horarios: { hora: string; modalidades: string[] }[] }[] {
    return disponibilidad.map(dia => ({
      fecha: dia.fecha,
      horarios: dia.horarios
        .filter(horario => horario.disponible)
        .map(horario => ({
          hora: horario.horaInicio,
          modalidades: horario.modalidades
        }))
    }));
  }
}

export const apiService = new ApiService();
export default apiService; 