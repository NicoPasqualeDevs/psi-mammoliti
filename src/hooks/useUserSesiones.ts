import { useState, useEffect, useCallback } from 'react';
import { Sesion } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface UseUserSesionesReturn {
  sesiones: Sesion[];
  cargando: boolean;
  error: string | null;
  refrescar: () => Promise<void>;
}

// Configuración dinámica de URL base
const getApiBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }
  return '/api';
};

export function useUserSesiones(): UseUserSesionesReturn {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { usuario, estaAutenticado } = useAuth();

  const cargarSesiones = useCallback(async () => {
    if (!estaAutenticado || !usuario?.email) {
      setSesiones([]);
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const response = await fetch(`${getApiBaseUrl()}/sesiones/usuario/${encodeURIComponent(usuario.email)}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener sesiones del usuario');
      }

      const sesionesData = await response.json();
      setSesiones(sesionesData);
    } catch (err) {
      console.error('Error cargando sesiones del usuario:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setSesiones([]);
    } finally {
      setCargando(false);
    }
  }, [usuario?.email, estaAutenticado]);

  const refrescar = useCallback(async () => {
    await cargarSesiones();
  }, [cargarSesiones]);

  useEffect(() => {
    cargarSesiones();
  }, [cargarSesiones]);

  return {
    sesiones,
    cargando,
    error,
    refrescar
  };
} 