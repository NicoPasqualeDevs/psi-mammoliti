export interface Psicologo {
  id: string;
  nombre: string;
  apellido: string;
  especialidades: string[];
  experiencia: number;
  precio: number;
  imagen: string;
  descripcion: string;
  rating: number;
  disponibilidad: HorarioDisponible[];
}

export interface HorarioDisponible {
  fecha: string;
  horarios: string[];
}

export interface Sesion {
  id: string;
  psicologoId: string;
  fecha: string;
  hora: string;
  paciente: {
    nombre: string;
    email: string;
    telefono: string;
  };
  especialidad: string;
  estado: 'confirmada' | 'pendiente' | 'cancelada';
}

export interface FiltrosBusqueda {
  especialidad: string;
  precioMax: number;
  disponibilidad: string;
} 