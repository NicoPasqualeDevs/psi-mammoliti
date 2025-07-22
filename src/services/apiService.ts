import { Psicologo, Sesion } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

// Función helper para hacer peticiones HTTP
async function fetchAPI(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export class ApiService {
  // Psicólogos
  static async obtenerPsicologos(): Promise<Psicologo[]> {
    try {
      return await fetchAPI('/psicologos');
    } catch (error) {
      console.error('Error obteniendo psicólogos:', error);
      throw new Error('Error al cargar psicólogos');
    }
  }

  static async obtenerPsicologoPorId(id: string): Promise<Psicologo | null> {
    try {
      return await fetchAPI(`/psicologos/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      console.error('Error obteniendo psicólogo:', error);
      throw new Error('Error al cargar psicólogo');
    }
  }

  static async crearPsicologo(psicologo: Psicologo): Promise<void> {
    try {
      await fetchAPI('/psicologos', {
        method: 'POST',
        body: JSON.stringify(psicologo),
      });
    } catch (error) {
      console.error('Error creando psicólogo:', error);
      throw new Error('Error al crear psicólogo');
    }
  }

  static async actualizarPsicologo(psicologo: Psicologo): Promise<void> {
    try {
      await fetchAPI(`/psicologos/${psicologo.id}`, {
        method: 'PUT',
        body: JSON.stringify(psicologo),
      });
    } catch (error) {
      console.error('Error actualizando psicólogo:', error);
      throw new Error('Error al actualizar psicólogo');
    }
  }

  static async eliminarPsicologo(id: string): Promise<void> {
    try {
      await fetchAPI(`/psicologos/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error eliminando psicólogo:', error);
      throw new Error('Error al eliminar psicólogo');
    }
  }

  // Sesiones
  static async obtenerSesiones(): Promise<Sesion[]> {
    try {
      return await fetchAPI('/sesiones');
    } catch (error) {
      console.error('Error obteniendo sesiones:', error);
      throw new Error('Error al cargar sesiones');
    }
  }

  static async crearSesion(sesion: Omit<Sesion, 'id' | 'estado'>): Promise<string> {
    try {
      const response = await fetchAPI('/sesiones', {
        method: 'POST',
        body: JSON.stringify(sesion),
      });
      return response.id;
    } catch (error) {
      console.error('Error creando sesión:', error);
      throw new Error('Error al crear sesión');
    }
  }

  // Especialidades
  static async obtenerEspecialidades(): Promise<string[]> {
    try {
      return await fetchAPI('/especialidades');
    } catch (error) {
      console.error('Error obteniendo especialidades:', error);
      return [];
    }
  }

  // Estadísticas
  static async obtenerEstadisticas(): Promise<{
    totalPsicologos: number;
    totalSesiones: number;
    especialidadesUnicas: number;
  }> {
    try {
      return await fetchAPI('/stats');
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        totalPsicologos: 0,
        totalSesiones: 0,
        especialidadesUnicas: 0
      };
    }
  }

  // Limpiar base de datos
  static async limpiarBaseDatos(): Promise<void> {
    try {
      await fetchAPI('/reset', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error limpiando base de datos:', error);
      throw new Error('Error al limpiar base de datos');
    }
  }
}

export default ApiService; 