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
  tieneHorariosConfigurados?: boolean;
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
  estado: 'confirmada' | 'cancelada' | 'completada';
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

// Nuevos tipos para sistema de horarios reales

export interface HorarioTrabajo {
  id?: number;
  psicologoId: string;
  diaSemana: number; // 0=Domingo, 1=Lunes, etc.
  horaInicio: string; // "09:00"
  horaFin: string; // "17:00"
  modalidades: Modalidad[];
  activo: boolean;
  createdAt?: Date;
}

export interface HorarioExcepcion {
  id?: number;
  psicologoId: string;
  fecha: string; // "YYYY-MM-DD"
  tipo: 'bloqueado' | 'horario_especial';
  horaInicio?: string;
  horaFin?: string;
  modalidades?: Modalidad[];
  motivo?: string;
  createdAt?: Date;
}

export interface Cita {
  id: string;
  psicologoId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  modalidad: Modalidad;
  estado: 'confirmada' | 'cancelada' | 'completada';
  sesionId?: string;
  createdAt?: Date;
}

export interface ConfiguracionHorarios {
  id?: number;
  psicologoId: string;
  duracionSesion: number; // minutos
  tiempoBuffer: number; // minutos entre sesiones
  diasAnticipacion: number; // días máximos para agendar
  zonaHoraria: string;
  autoGenerar: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HorarioGenerado {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  modalidades: Modalidad[];
  disponible: boolean;
  ocupadoPor?: string; // ID de la cita
}

export interface PlantillaHorario {
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  modalidades: Modalidad[];
  intervaloMinutos: number;
}

export interface DisponibilidadRespuesta {
  fecha: string;
  horarios: HorarioGenerado[];
}

// Tipos adicionales para componentes específicos
export interface SesionConPsicologo extends Sesion {
  psicologo?: Psicologo;
}

export interface SesionConPsicologoRequerido extends Sesion {
  psicologo: Psicologo;
}

export interface CalendarioDiaData {
  fecha: Date;
  fechaStr: string;
  horarios: CalendarioHorario[];
}

export interface CalendarioSemanaData {
  inicio: Date;
  fin: Date;
  dias: CalendarioDiaData[];
}

export interface SesionAgrupada {
  paciente: {
    nombre: string;
    email: string;
    telefono: string;
  };
  sesiones: Sesion[];
} 