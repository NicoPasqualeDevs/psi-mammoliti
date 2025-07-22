import { useState, useEffect } from 'react';
import { Psicologo, Sesion } from '../types';
import ApiService from '../services/apiService';

interface DatabaseState {
  psicologos: Psicologo[];
  sesiones: Sesion[];
  especialidades: string[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  stats: {
    totalPsicologos: number;
    totalSesiones: number;
    especialidadesUnicas: number;
  };
}

export function useDatabase() {
  const [state, setState] = useState<DatabaseState>({
    psicologos: [],
    sesiones: [],
    especialidades: [],
    loading: true,
    error: null,
    initialized: false,
    stats: {
      totalPsicologos: 0,
      totalSesiones: 0,
      especialidadesUnicas: 0
    }
  });

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const [psicologos, sesiones, especialidades, stats] = await Promise.all([
          ApiService.obtenerPsicologos(),
          ApiService.obtenerSesiones(),
          ApiService.obtenerEspecialidades(),
          ApiService.obtenerEstadisticas()
        ]);

        setState({
          psicologos,
          sesiones,
          especialidades,
          stats,
          loading: false,
          error: null,
          initialized: true
        });
      } catch (error) {
        console.error('Error cargando datos:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Error al cargar datos',
          initialized: true
        }));
      }
    };

    cargarDatos();
  }, []);

  // Función para recargar datos
  const recargarDatos = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const [psicologos, sesiones, especialidades, stats] = await Promise.all([
        ApiService.obtenerPsicologos(),
        ApiService.obtenerSesiones(),
        ApiService.obtenerEspecialidades(),
        ApiService.obtenerEstadisticas()
      ]);

      setState(prev => ({
        ...prev,
        psicologos,
        sesiones,
        especialidades,
        stats,
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error recargando datos:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al recargar datos'
      }));
    }
  };

  // Función para insertar psicólogo
  const insertarPsicologo = async (psicologo: Psicologo): Promise<boolean> => {
    try {
      await ApiService.crearPsicologo(psicologo);
      await recargarDatos();
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
      await ApiService.actualizarPsicologo(psicologo);
      await recargarDatos();
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
      await ApiService.eliminarPsicologo(id);
      await recargarDatos();
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

  // Función para insertar sesión
  const insertarSesion = async (sesion: Omit<Sesion, 'id' | 'estado'>): Promise<boolean> => {
    try {
      await ApiService.crearSesion(sesion);
      await recargarDatos();
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
  const limpiarYRecargarBaseDatos = async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await ApiService.limpiarBaseDatos();
      await recargarDatos();
      return true;
    } catch (error) {
      console.error('Error limpiando base de datos:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al limpiar base de datos'
      }));
      return false;
    }
  };

  return {
    ...state,
    insertarPsicologo,
    actualizarPsicologo,
    eliminarPsicologo,
    insertarSesion,
    limpiarYRecargarBaseDatos,
    recargarDatos
  };
} 