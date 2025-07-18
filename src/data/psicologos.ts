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
    modalidades: ['online', 'presencial'],
    disponibilidad: [
      // Julio 2025
      { fecha: '2025-07-18', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-07-21', horarios: [
        { hora: '09:00', modalidades: ['online'] },
        { hora: '11:00', modalidades: ['online', 'presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-07-23', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-07-25', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '11:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-07-28', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-07-30', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online', 'presencial'] }
      ]},
      // Agosto 2025
      { fecha: '2025-08-01', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-08-04', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-06', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '11:00', modalidades: ['online'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-08-08', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '10:00', modalidades: ['online', 'presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-11', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-08-13', horarios: [
        { hora: '09:00', modalidades: ['online'] },
        { hora: '11:00', modalidades: ['online', 'presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-15', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-08-18', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-20', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '11:00', modalidades: ['online', 'presencial'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-22', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-08-25', horarios: [
        { hora: '09:00', modalidades: ['online'] },
        { hora: '11:00', modalidades: ['online', 'presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-27', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-29', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online', 'presencial'] }
      ]},
      // Septiembre 2025
      { fecha: '2025-09-01', horarios: [
        { hora: '09:00', modalidades: ['online'] },
        { hora: '11:00', modalidades: ['online', 'presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-03', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-09-05', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-08', horarios: [
        { hora: '09:00', modalidades: ['online'] },
        { hora: '11:00', modalidades: ['online', 'presencial'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-09-10', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-12', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-15', horarios: [
        { hora: '09:00', modalidades: ['online'] },
        { hora: '11:00', modalidades: ['online', 'presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-09-17', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['online'] }
      ]}
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
    modalidades: ['presencial'],
    disponibilidad: [
      // Julio 2025
      { fecha: '2025-07-19', horarios: [
        { hora: '11:00', modalidades: ['presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-07-22', horarios: [
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-07-24', horarios: [
        { hora: '11:00', modalidades: ['presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-07-26', horarios: [
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '11:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-07-29', horarios: [
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-07-31', horarios: [
        { hora: '11:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['presencial'] }
      ]},
      // Agosto 2025
      { fecha: '2025-08-02', horarios: [
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-08-05', horarios: [
        { hora: '11:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-08-07', horarios: [
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-08-09', horarios: [
        { hora: '11:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-08-12', horarios: [
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-08-14', horarios: [
        { hora: '11:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-08-16', horarios: [
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-08-19', horarios: [
        { hora: '11:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-08-21', horarios: [
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-08-23', horarios: [
        { hora: '11:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-08-26', horarios: [
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-08-28', horarios: [
        { hora: '11:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-08-30', horarios: [
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['presencial'] }
      ]},
      // Septiembre 2025
      { fecha: '2025-09-02', horarios: [
        { hora: '11:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-09-04', horarios: [
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-09-06', horarios: [
        { hora: '11:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-09-09', horarios: [
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-09-11', horarios: [
        { hora: '11:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-09-13', horarios: [
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-09-16', horarios: [
        { hora: '11:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-09-18', horarios: [
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['presencial'] }
      ]}
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
    modalidades: ['online', 'presencial'],
    disponibilidad: [
      // Julio 2025
      { fecha: '2025-07-18', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '09:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online', 'presencial'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-07-20', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online'] },
        { hora: '16:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-07-23', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-07-25', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '09:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online'] },
        { hora: '18:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-07-27', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '16:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-07-30', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '09:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online'] },
        { hora: '16:00', modalidades: ['online', 'presencial'] }
      ]},
      // Agosto 2025
      { fecha: '2025-08-01', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online', 'presencial'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-03', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-06', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '09:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online', 'presencial'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-08', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-10', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['online', 'presencial'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-13', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-15', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '09:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online', 'presencial'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-17', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-20', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online', 'presencial'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-22', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-24', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '09:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['online', 'presencial'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-27', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-29', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online', 'presencial'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-31', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      // Septiembre 2025
      { fecha: '2025-09-03', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '09:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online', 'presencial'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-05', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-07', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '17:00', modalidades: ['online', 'presencial'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-10', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-12', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '09:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online', 'presencial'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-14', horarios: [
        { hora: '09:00', modalidades: ['online', 'presencial'] },
        { hora: '10:00', modalidades: ['online'] },
        { hora: '15:00', modalidades: ['presencial'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-17', horarios: [
        { hora: '08:00', modalidades: ['online'] },
        { hora: '10:00', modalidades: ['presencial'] },
        { hora: '16:00', modalidades: ['online', 'presencial'] },
        { hora: '17:00', modalidades: ['online'] }
      ]}
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
    modalidades: ['online'],
    disponibilidad: [
      // Julio 2025
      { fecha: '2025-07-19', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-07-21', horarios: [
        { hora: '11:00', modalidades: ['online'] },
        { hora: '12:00', modalidades: ['online'] },
        { hora: '16:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-07-24', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['online'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-07-26', horarios: [
        { hora: '11:00', modalidades: ['online'] },
        { hora: '12:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-07-28', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['online'] },
        { hora: '16:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-07-31', horarios: [
        { hora: '11:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      // Agosto 2025
      { fecha: '2025-08-02', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['online'] },
        { hora: '16:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-04', horarios: [
        { hora: '11:00', modalidades: ['online'] },
        { hora: '12:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-07', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['online'] },
        { hora: '16:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-09', horarios: [
        { hora: '11:00', modalidades: ['online'] },
        { hora: '12:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-11', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['online'] },
        { hora: '16:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-14', horarios: [
        { hora: '11:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-16', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['online'] },
        { hora: '16:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-18', horarios: [
        { hora: '11:00', modalidades: ['online'] },
        { hora: '12:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['online'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-21', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-23', horarios: [
        { hora: '11:00', modalidades: ['online'] },
        { hora: '12:00', modalidades: ['online'] },
        { hora: '16:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-25', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['online'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-28', horarios: [
        { hora: '11:00', modalidades: ['online'] },
        { hora: '12:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-30', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['online'] },
        { hora: '16:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      // Septiembre 2025
      { fecha: '2025-09-01', horarios: [
        { hora: '11:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-04', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['online'] },
        { hora: '16:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-06', horarios: [
        { hora: '11:00', modalidades: ['online'] },
        { hora: '12:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-08', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['online'] },
        { hora: '16:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-11', horarios: [
        { hora: '11:00', modalidades: ['online'] },
        { hora: '12:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-13', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['online'] },
        { hora: '16:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-15', horarios: [
        { hora: '11:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] },
        { hora: '18:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-18', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['online'] },
        { hora: '16:00', modalidades: ['online'] },
        { hora: '17:00', modalidades: ['online'] }
      ]}
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
    modalidades: ['online', 'presencial'],
    disponibilidad: [
      // Julio 2025
      { fecha: '2025-07-18', horarios: [
        { hora: '13:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-07-22', horarios: [
        { hora: '13:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-07-24', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['presencial'] },
        { hora: '14:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-07-29', horarios: [
        { hora: '13:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-07-31', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['presencial'] }
      ]},
      // Agosto 2025
      { fecha: '2025-08-05', horarios: [
        { hora: '13:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-08-07', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['presencial'] },
        { hora: '14:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-12', horarios: [
        { hora: '13:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-08-14', horarios: [
        { hora: '13:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-08-19', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['presencial'] },
        { hora: '14:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-08-21', horarios: [
        { hora: '13:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-08-26', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-08-28', horarios: [
        { hora: '13:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online', 'presencial'] }
      ]},
      // Septiembre 2025
      { fecha: '2025-09-02', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['presencial'] },
        { hora: '14:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-04', horarios: [
        { hora: '13:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['presencial'] }
      ]},
      { fecha: '2025-09-09', horarios: [
        { hora: '13:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-09-11', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['presencial'] },
        { hora: '14:00', modalidades: ['online'] }
      ]},
      { fecha: '2025-09-16', horarios: [
        { hora: '13:00', modalidades: ['online'] },
        { hora: '14:00', modalidades: ['presencial'] },
        { hora: '15:00', modalidades: ['online', 'presencial'] }
      ]},
      { fecha: '2025-09-18', horarios: [
        { hora: '12:00', modalidades: ['online'] },
        { hora: '13:00', modalidades: ['presencial'] }
      ]}
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