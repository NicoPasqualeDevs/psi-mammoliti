import { Psicologo, Sesion } from '../types';

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
}

export const apiService = new ApiService();
export default apiService; 