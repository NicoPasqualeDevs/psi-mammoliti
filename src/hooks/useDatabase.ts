import { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/apiService';
import { Psicologo, Sesion, Modalidad } from '../types';

interface DatabaseState {
  psicologos: Psicologo[];
  sesiones: Sesion[];
  especialidades: string[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export function useDatabase() {
  const [state, setState] = useState<DatabaseState>({
    psicologos: [],
    sesiones: [],
    especialidades: [],
    loading: true,
    error: null,
    initialized: false
  });

  // Cargar datos del backend
  const cargarDatos = useCallback(async () => {
    try {
      const [psicologos, sesiones, especialidades] = await Promise.all([
        ApiService.obtenerPsicologos(),
        ApiService.obtenerSesiones(),
        ApiService.obtenerEspecialidades()
      ]);

      setState(prev => ({
        ...prev,
        psicologos,
        sesiones,
        especialidades,
        loading: false,
        error: null
      }));
      
    } catch (error) {
      console.error('Error cargando datos del backend:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Error al conectar con el servidor. Verifica que el backend esté ejecutándose.', 
        loading: false 
      }));
    }
  }, []);

  // Inicializar conexión con el backend
  const inicializar = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Intentar cargar datos del backend
      await cargarDatos();
      
      setState(prev => ({ ...prev, initialized: true, loading: false }));
      
    } catch (error) {
      console.error('Error inicializando conexión con backend:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Error al inicializar la conexión con el servidor', 
        loading: false 
      }));
    }
  }, [cargarDatos]);

  // Recargar datos
  const refrescar = useCallback(async () => {
    await cargarDatos();
  }, [cargarDatos]);

  // Insertar nueva sesión
  const insertarSesion = useCallback(async (sesion: Sesion) => {
    try {
      await ApiService.crearSesion(sesion);
      await cargarDatos(); // Recargar datos después de insertar
      return true;
    } catch (error) {
      console.error('Error insertando sesión:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Error al agendar la sesión en el servidor' 
      }));
      return false;
    }
  }, [cargarDatos]);

  // Eliminar psicólogo
  const eliminarPsicologo = useCallback(async (id: string) => {
    try {
      await ApiService.eliminarPsicologo(id);
      await cargarDatos(); // Recargar datos después de eliminar
      return true;
    } catch (error) {
      console.error('Error eliminando psicólogo:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Error al eliminar el psicólogo del servidor' 
      }));
      return false;
    }
  }, [cargarDatos]);

  // Insertar psicólogo
  const insertarPsicologo = useCallback(async (psicologo: Psicologo) => {
    try {
      // Validar datos antes de enviar
      if (!psicologo.id || !psicologo.nombre || !psicologo.apellido) {
        throw new Error('Datos del psicólogo incompletos: falta ID, nombre o apellido');
      }
      
      if (!psicologo.especialidades || psicologo.especialidades.length === 0) {
        throw new Error('El psicólogo debe tener al menos una especialidad');
      }
      
      if (!psicologo.modalidades || psicologo.modalidades.length === 0) {
        throw new Error('El psicólogo debe tener al menos una modalidad disponible');
      }
      
      // Verificar que no existe un psicólogo con el mismo ID
      const psicologoExistente = state.psicologos.find(p => p.id === psicologo.id);
      if (psicologoExistente) {
        throw new Error(`Ya existe un psicólogo con el ID: ${psicologo.id}`);
      }
      
      await ApiService.crearPsicologo(psicologo);
      await cargarDatos(); // Recargar datos después de insertar
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error insertando psicólogo:', errorMessage, error);
      
      setState(prev => ({ 
        ...prev, 
        error: `Error al agregar el psicólogo: ${errorMessage}` 
      }));
      return false;
    }
  }, [cargarDatos, state.psicologos]);

  // Actualizar psicólogo
  const actualizarPsicologo = useCallback(async (psicologo: Psicologo) => {
    try {
      // Validar datos antes de actualizar
      if (!psicologo.id || !psicologo.nombre || !psicologo.apellido) {
        throw new Error('Datos del psicólogo incompletos: falta ID, nombre o apellido');
      }
      
      if (!psicologo.especialidades || psicologo.especialidades.length === 0) {
        throw new Error('El psicólogo debe tener al menos una especialidad');
      }
      
      if (!psicologo.modalidades || psicologo.modalidades.length === 0) {
        throw new Error('El psicólogo debe tener al menos una modalidad disponible');
      }
      
      // Verificar que el psicólogo existe
      const psicologoExistente = state.psicologos.find(p => p.id === psicologo.id);
      if (!psicologoExistente) {
        throw new Error(`No se encontró el psicólogo con ID: ${psicologo.id}`);
      }
      
      await ApiService.actualizarPsicologo(psicologo);
      await cargarDatos(); // Recargar datos después de actualizar
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error actualizando psicólogo:', errorMessage, error);
      
      setState(prev => ({ 
        ...prev, 
        error: `Error al actualizar el psicólogo: ${errorMessage}` 
      }));
      return false;
    }
  }, [cargarDatos, state.psicologos]);

  // Obtener psicólogo por ID
  const obtenerPsicologoPorId = useCallback((id: string): Psicologo | null => {
    return state.psicologos.find(p => p.id === id) || null;
  }, [state.psicologos]);

  // Filtrar psicólogos
  const filtrarPsicologos = useCallback((
    especialidad?: string,
    precioMax?: number,
    modalidad?: string
  ): Psicologo[] => {
    return state.psicologos.filter(psicologo => {
      if (especialidad && especialidad !== '' && 
          !psicologo.especialidades.includes(especialidad)) {
        return false;
      }
      
      if (precioMax && psicologo.precio > precioMax) {
        return false;
      }
      
      if (modalidad && modalidad !== '' && 
          !psicologo.modalidades.includes(modalidad as Modalidad)) {
        return false;
      }
      
      return true;
    });
  }, [state.psicologos]);

  // Obtener sesiones por psicólogo
  const obtenerSesionesPorPsicologo = useCallback((psicologoId: string): Sesion[] => {
    return state.sesiones.filter(sesion => sesion.psicologoId === psicologoId);
  }, [state.sesiones]);

  // Limpiar error
  const limpiarError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Limpiar y recargar base de datos
  const limpiarYRecargarDB = useCallback(async () => {
    try {
      await ApiService.limpiarBaseDatos();
      await cargarDatos();
      return true;
    } catch (error) {
      console.error('Error limpiando base de datos:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Error al limpiar la base de datos del servidor' 
      }));
      return false;
    }
  }, [cargarDatos]);

  // Inicializar al montar el componente
  useEffect(() => {
    inicializar();
  }, [inicializar]);

  return {
    // Datos
    psicologos: state.psicologos,
    sesiones: state.sesiones,
    especialidades: state.especialidades,
    
    // Estado
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,
    
    // Métodos
    refrescar,
    insertarSesion,
    eliminarPsicologo,
    insertarPsicologo,
    actualizarPsicologo,
    obtenerPsicologoPorId,
    filtrarPsicologos,
    obtenerSesionesPorPsicologo,
    limpiarError,
    limpiarYRecargarDB,
    
    // Estadísticas
    stats: {
      totalPsicologos: state.psicologos.length,
      totalSesiones: state.sesiones.length,
      especialidadesUnicas: state.especialidades.length
    }
  };
} 