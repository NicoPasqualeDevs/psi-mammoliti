import { Psicologo } from '../types';

export const psicologos: Psicologo[] = [
  {
    id: '1',
    nombre: 'Ana',
    apellido: 'García Ruiz',
    especialidades: ['Ansiedad', 'Depresión', 'Terapia Cognitivo-Conductual'],
    experiencia: 8,
    precio: 75,
    imagen: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    descripcion: 'Psicóloga clínica especializada en trastornos de ansiedad y depresión. Enfoque en terapia.',
    rating: 4.8,
    disponibilidad: [
      { fecha: '2024-01-15', horarios: ['09:00', '10:00', '15:00', '16:00'] },
      { fecha: '2024-01-16', horarios: ['09:00', '11:00', '14:00'] },
      { fecha: '2024-01-17', horarios: ['10:00', '15:00', '16:00', '17:00'] }
    ]
  },
  {
    id: '2',
    nombre: 'Carlos',
    apellido: 'Mendoza López',
    especialidades: ['Terapia Familiar', 'Terapia de Pareja', 'Conflictos Familiares'],
    experiencia: 12,
    precio: 90,
    imagen: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
    descripcion: 'Especialista en terapia familiar y de pareja. Más de 12 años ayudando a fortalecer relaciones.',
    rating: 4.9,
    disponibilidad: [
      { fecha: '2024-01-15', horarios: ['11:00', '14:00', '17:00'] },
      { fecha: '2024-01-16', horarios: ['09:00', '10:00', '15:00', '16:00'] },
      { fecha: '2024-01-18', horarios: ['09:00', '11:00', '14:00', '15:00'] }
    ]
  },
  {
    id: '3',
    nombre: 'María',
    apellido: 'Fernández Silva',
    especialidades: ['Psicología Infantil', 'TDAH', 'Trastornos del Aprendizaje'],
    experiencia: 6,
    precio: 65,
    imagen: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    descripcion: 'Psicóloga infantil experta en TDAH y dificultades del aprendizaje. Enfoque lúdico y educativo.',
    rating: 4.7,
    disponibilidad: [
      { fecha: '2024-01-15', horarios: ['08:00', '09:00', '16:00', '17:00'] },
      { fecha: '2024-01-17', horarios: ['08:00', '09:00', '10:00', '11:00'] },
      { fecha: '2024-01-18', horarios: ['16:00', '17:00', '18:00'] }
    ]
  },
  {
    id: '4',
    nombre: 'Roberto',
    apellido: 'Jiménez Castro',
    especialidades: ['Estrés Laboral', 'Burnout', 'Coaching Psicológico'],
    experiencia: 10,
    precio: 80,
    imagen: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face',
    descripcion: 'Psicólogo organizacional especializado en estrés laboral y burnout. Enfoque en bienestar.',
    rating: 4.6,
    disponibilidad: [
      { fecha: '2024-01-16', horarios: ['12:00', '13:00', '17:00', '18:00'] },
      { fecha: '2024-01-17', horarios: ['12:00', '13:00', '14:00'] },
      { fecha: '2024-01-18', horarios: ['10:00', '11:00', '12:00', '13:00'] }
    ]
  },
  {
    id: '5',
    nombre: 'Lucía',
    apellido: 'Morales Vega',
    especialidades: ['Trauma', 'EMDR', 'Trastorno de Estrés Postraumático'],
    experiencia: 15,
    precio: 100,
    imagen: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face',
    descripcion: 'Especialista en trauma y EMDR. Amplia experiencia en trastornos de estrés postraumático.',
    rating: 4.9,
    disponibilidad: [
      { fecha: '2024-01-15', horarios: ['13:00', '14:00'] },
      { fecha: '2024-01-16', horarios: ['13:00', '14:00', '15:00'] },
      { fecha: '2024-01-17', horarios: ['13:00', '14:00', '15:00', '16:00'] }
    ]
  }
];

export const especialidades = [
  'Todas',
  'Ansiedad',
  'Depresión',
  'Terapia Cognitivo-Conductual',
  'Terapia Familiar',
  'Terapia de Pareja',
  'Conflictos Familiares',
  'Psicología Infantil',
  'TDAH',
  'Trastornos del Aprendizaje',
  'Estrés Laboral',
  'Burnout',
  'Coaching Psicológico',
  'Trauma',
  'EMDR',
  'Trastorno de Estrés Postraumático'
]; 