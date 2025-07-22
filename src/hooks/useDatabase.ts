import { useState, useEffect, useCallback } from 'react';
import DatabaseService from '../database/database';
import { migrarDatosIniciales } from '../database/migration';
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

  const db = DatabaseService.getInstance();

  // Cargar datos de la base de datos
  const cargarDatos = useCallback(async () => {
    try {
      const [psicologos, sesiones, especialidades] = await Promise.all([
        db.obtenerPsicologos(),
        db.obtenerSesiones(),
        db.obtenerEspecialidades()
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
      setState(prev => ({ 
        ...prev, 
        error: 'Error al cargar datos', 
        loading: false 
      }));
    }
  }, [db]);

  // Inicializar base de datos y cargar datos
  const inicializar = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Esperar a que la base de datos se inicialice
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Migrar datos iniciales si es necesario
      await migrarDatosIniciales();
      
      // Cargar todos los datos
      await cargarDatos();
      
      setState(prev => ({ ...prev, initialized: true, loading: false }));
      
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Error al inicializar la base de datos', 
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
      await db.insertarSesion(sesion);
      await cargarDatos(); // Recargar datos después de insertar
      return true;
    } catch (error) {
      console.error('Error insertando sesión:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Error al agendar la sesión' 
      }));
      return false;
    }
  }, [db, cargarDatos]);

  // Eliminar psicólogo
  const eliminarPsicologo = useCallback(async (id: string) => {
    try {
      await db.eliminarPsicologo(id);
      await cargarDatos(); // Recargar datos después de eliminar
      return true;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Error al eliminar el psicólogo' 
      }));
      return false;
    }
  }, [db, cargarDatos]);

  // Insertar psicólogo
  const insertarPsicologo = useCallback(async (psicologo: Psicologo) => {
    try {

      
      // Validar datos antes de insertar
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
      
      await db.insertarPsicologo(psicologo);
      
      await cargarDatos(); // Recargar datos después de insertar
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

      
      setState(prev => ({ 
        ...prev, 
        error: `Error al agregar el psicólogo: ${errorMessage}` 
      }));
      return false;
    }
  }, [db, cargarDatos, state.psicologos]);

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
      
      await db.actualizarPsicologo(psicologo);
      
      await cargarDatos(); // Recargar datos después de actualizar
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error actualizando psicólogo:', errorMessage, error);
      
      setState(prev => ({ 
        ...prev, 
        error: `Error al actualizar el psicólogo: ${errorMessage}` 
      }));
      return false;
    }
  }, [db, cargarDatos, state.psicologos]);

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
    
    // Estadísticas
    stats: {
      totalPsicologos: state.psicologos.length,
      totalSesiones: state.sesiones.length,
      especialidadesUnicas: state.especialidades.length
    }
  };
} 