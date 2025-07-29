import { useState, useEffect } from 'react';
import { Psicologo, Sesion, Modalidad } from '../types';
import { apiService } from '../services/apiService';
import { getApiBaseUrl } from '../utils/apiConfig';

interface DatabaseState {
  psicologos: Psicologo[];
  sesiones: Sesion[];
  especialidades: string[];
  loading: boolean;
  recargando: boolean;
  error: string | null;
  initialized: boolean;
}

interface DatabaseStats {
  totalPsicologos: number;
  totalSesiones: number;
  especialidadesUnicas: number;
}

export function useDatabase() {
  const [state, setState] = useState<DatabaseState>({
    psicologos: [],
    sesiones: [],
    especialidades: [],
    loading: true,
    recargando: false,
    error: null,
    initialized: false
  });

  const [stats, setStats] = useState<DatabaseStats>({
    totalPsicologos: 0,
    totalSesiones: 0,
    especialidadesUnicas: 0
  });

  // Función para cargar todos los datos
  const cargarDatos = async (esRecarga = false) => {
    // Solo mostrar loading completo en carga inicial
    if (!state.initialized) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    } else if (esRecarga) {
      setState(prev => ({ ...prev, recargando: true, error: null }));
    }

    try {
      // Cargar datos en paralelo desde el backend real
      const [psicologosData, sesionesData] = await Promise.all([
        apiService.obtenerPsicologos(),
        apiService.obtenerSesiones()
      ]);

      // Extraer especialidades únicas de los psicólogos
      const especialidadesSet = new Set<string>();
      psicologosData.forEach(psicologo => {
        psicologo.especialidades.forEach(esp => especialidadesSet.add(esp));
      });
      const especialidades = Array.from(especialidadesSet).sort();

      // Actualizar estado
      setState({
        psicologos: psicologosData,
        sesiones: sesionesData,
        especialidades,
        loading: false,
        recargando: false,
        error: null,
        initialized: true
      });

      // Actualizar estadísticas
      setStats({
        totalPsicologos: psicologosData.length,
        totalSesiones: sesionesData.length,
        especialidadesUnicas: especialidades.length
      });

    } catch (error) {
      console.error('Error cargando datos:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        recargando: false,
        error: error instanceof Error ? error.message : 'Error desconocido al cargar datos',
        initialized: false
      }));
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Función para insertar nuevo psicólogo
  const insertarPsicologo = async (psicologo: Psicologo): Promise<boolean> => {
    try {
      // Crear el psicólogo en el backend
      const response = await fetch(`${getApiBaseUrl()}/psicologos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(psicologo),
      });

      if (!response.ok) {
        throw new Error('Error al crear psicólogo en el servidor');
      }

      // Recargar datos para mostrar el nuevo psicólogo
      await cargarDatos(true);
      
      return true;
    } catch (error) {
      console.error('Error insertando psicólogo:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al insertar psicólogo'
      }));
      return false;
    }
  };

  // Función para actualizar psicólogo
  const actualizarPsicologo = async (psicologo: Psicologo): Promise<boolean> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/psicologos/${psicologo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(psicologo),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar psicólogo en el servidor');
      }

      // Recargar datos para mostrar los cambios
      await cargarDatos(true);
      
      return true;
    } catch (error) {
      console.error('Error actualizando psicólogo:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al actualizar psicólogo'
      }));
      return false;
    }
  };

  // Función para eliminar psicólogo
  const eliminarPsicologo = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/psicologos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar psicólogo del servidor');
      }

      // Recargar datos para mostrar los cambios
      await cargarDatos(true);
      
      return true;
    } catch (error) {
      console.error('Error eliminando psicólogo:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al eliminar psicólogo'
      }));
      return false;
    }
  };

  // Función para insertar nueva sesión
  const insertarSesion = async (sesion: Omit<Sesion, 'id' | 'estado'>): Promise<boolean> => {
    try {
      const sesionCompleta = await apiService.crearSesion(sesion);

      // Actualizar estado local inmediatamente para mejor UX
      setState(prev => ({
        ...prev,
        sesiones: [...prev.sesiones, { ...sesionCompleta, estado: 'confirmada' }]
      }));

      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        totalSesiones: prev.totalSesiones + 1
      }));

      return true;
    } catch (error) {
      console.error('Error insertando sesión:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al insertar sesión'
      }));
      return false;
    }
  };

  // Función para limpiar y recargar base de datos
  const limpiarYRecargarDB = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/reset`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al limpiar la base de datos');
      }

      // Recargar todos los datos
      await cargarDatos(true);
      
      return true;
    } catch (error) {
      console.error('Error limpiando base de datos:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al limpiar base de datos'
      }));
      return false;
    }
  };

  // Función para filtrar psicólogos
  const filtrarPsicologos = (
    especialidad: string,
    precioMax: number,
    modalidad: Modalidad | ''
  ) => {
    return state.psicologos.filter(psicologo => {
      // Filtro por horarios disponibles - Solo mostrar psicólogos con horarios configurados
      if (!psicologo.tieneHorariosConfigurados) {
        return false;
      }
      
      // Filtro por especialidad
      if (especialidad && !psicologo.especialidades.includes(especialidad)) {
        return false;
      }
      
      // Filtro por precio máximo
      if (psicologo.precio > precioMax) {
        return false;
      }
      
      // Filtro por modalidad
      if (modalidad && !psicologo.modalidades.includes(modalidad)) {
        return false;
      }
      
      return true;
    });
  };

  // Función para limpiar errores
  const limpiarError = () => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  };

  return {
    // Estado
    psicologos: state.psicologos,
    sesiones: state.sesiones,
    especialidades: state.especialidades,
    loading: state.loading,
    recargando: state.recargando,
    error: state.error,
    initialized: state.initialized,
    stats,

    // Funciones
    cargarDatos,
    insertarPsicologo,
    actualizarPsicologo,
    eliminarPsicologo,
    insertarSesion,
    limpiarYRecargarDB,
    filtrarPsicologos,
    limpiarError
  };
} 