import { Psicologo, Sesion } from '../types';

// Configuración dinámica de URL base según el entorno
const getApiBaseUrl = () => {
  // En desarrollo (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }
  
  // En producción, usar rutas relativas que nginx manejará
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

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
}

export const apiService = new ApiService();
export default apiService; 