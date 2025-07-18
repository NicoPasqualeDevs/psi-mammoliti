export type Modalidad = 'online' | 'presencial';

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
  modalidades: Modalidad[];
}

export interface HorarioDisponible {
  fecha: string;
  horarios: HorarioModalidad[];
}

export interface HorarioModalidad {
  hora: string;
  modalidades: Modalidad[];
}

export interface Sesion {
  id: string;
  psicologoId: string;
  fecha: string;
  hora: string;
  modalidad: Modalidad;
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
  modalidad: Modalidad | '';
}

export interface CalendarioSemana {
  inicio: Date;
  fin: Date;
  dias: CalendarioDia[];
}

export interface CalendarioDia {
  fecha: Date;
  horarios: CalendarioHorario[];
}

export interface CalendarioHorario {
  hora: string;
  disponible: boolean;
  horaLocal: string;
  modalidades: Modalidad[];
}

export interface ConfiguracionTimezone {
  timezone: string;
  offset: number;
} 