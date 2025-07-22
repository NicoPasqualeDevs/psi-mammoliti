import { HorarioDisponible, Modalidad } from '../types';

// Horas disponibles para generar horarios
const HORAS_DISPONIBLES = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

// Función para obtener fechas futuras
function obtenerFechasFuturas(diasAGenerar = 30): string[] {
  const fechas: string[] = [];
  const hoy = new Date();
  
  for (let i = 1; i <= diasAGenerar; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    
    // Evitar fines de semana para este ejemplo
    if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
      fechas.push(fecha.toISOString().split('T')[0]);
    }
  }
  
  return fechas;
}

// Función para generar horarios aleatorios para un psicólogo
export function generarHorariosAleatorios(): HorarioDisponible[] {
  const fechas = obtenerFechasFuturas(21); // 3 semanas de días hábiles
  const disponibilidad: HorarioDisponible[] = [];
  
  fechas.forEach(fecha => {
    // Decidir aleatoriamente si el psicólogo trabaja este día (70% probabilidad)
    if (Math.random() > 0.3) {
      // Generar entre 2 y 6 horarios para este día
      const numHorarios = Math.floor(Math.random() * 5) + 2;
      const horariosDelDia = [];
      
      // Seleccionar horarios aleatorios sin repetir
      const horasDisponiblesHoy = [...HORAS_DISPONIBLES];
      
      for (let i = 0; i < numHorarios && horasDisponiblesHoy.length > 0; i++) {
        const indiceHora = Math.floor(Math.random() * horasDisponiblesHoy.length);
        const hora = horasDisponiblesHoy.splice(indiceHora, 1)[0];
        
        // Decidir modalidades para este horario
        const modalidades: Modalidad[] = [];
        
        // Probabilidades mejoradas para modalidades
        const probabilidadOnline = Math.random();
        const probabilidadPresencial = Math.random();
        
        // 60% de probabilidad para online
        if (probabilidadOnline > 0.4) {
          modalidades.push('online');
        }
        
        // 50% de probabilidad para presencial
        if (probabilidadPresencial > 0.5) {
          modalidades.push('presencial');
        }
        
        // Asegurar que al menos tenga una modalidad
        if (modalidades.length === 0) {
          modalidades.push(Math.random() > 0.5 ? 'online' : 'presencial');
        }
        
        horariosDelDia.push({
          hora,
          modalidades
        });
      }
      
      // Solo agregar días que tengan horarios
      if (horariosDelDia.length > 0) {
        disponibilidad.push({
          fecha,
          horarios: horariosDelDia.sort((a, b) => a.hora.localeCompare(b.hora))
        });
      }
    }
  });
  
  return disponibilidad;
}

// Función para generar datos básicos de psicólogo aleatorio
export function generarDatosPsicologoAleatorio(): {
  nombre: string;
  apellido: string;
  especialidades: string[];
  experiencia: number;
  precio: number;
  rating: number;
  modalidades: Modalidad[];
  descripcion: string;
} {
  const nombres = [
    'Ana', 'Carlos', 'María', 'Luis', 'Carmen', 'Jorge', 'Isabel', 'Miguel',
    'Laura', 'Roberto', 'Elena', 'Pablo', 'Sofía', 'Diego', 'Patricia', 'Andrés'
  ];
  
  const apellidos = [
    'García', 'Rodríguez', 'López', 'Martínez', 'González', 'Pérez', 'Sánchez',
    'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales'
  ];
  
  const especialidadesDisponibles = [
    'Ansiedad', 'Depresión', 'Terapia Cognitivo-Conductual', 'Terapia de Pareja',
    'Psicología Infantil', 'Trauma y PTSD', 'Trastornos Alimentarios',
    'Adicciones', 'Mindfulness', 'Psicología Positiva', 'Neuropsicología',
    'Terapia Familiar', 'Gestión del Estrés', 'Autoestima'
  ];
  
  const nombre = nombres[Math.floor(Math.random() * nombres.length)];
  const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
  
  // Seleccionar 1-4 especialidades aleatorias
  const numEspecialidades = Math.floor(Math.random() * 4) + 1;
  const especialidades: string[] = [];
  const especialidadesTemp = [...especialidadesDisponibles];
  
  for (let i = 0; i < numEspecialidades; i++) {
    const indice = Math.floor(Math.random() * especialidadesTemp.length);
    especialidades.push(especialidadesTemp.splice(indice, 1)[0]);
  }
  
  // Generar otros datos aleatorios
  const experiencia = Math.floor(Math.random() * 15) + 2; // 2-16 años
  const precio = Math.floor(Math.random() * 151) + 50; // 50-200
  const rating = Math.round((Math.random() * 2 + 3) * 10) / 10; // 3.0-5.0
  
  // Modalidades (ambas disponibles por defecto)
  const modalidades: Modalidad[] = ['online', 'presencial'];
  
  // Descripción básica
  const descripcion = `Psicólogo/a especializado/a en ${especialidades[0].toLowerCase()} con ${experiencia} años de experiencia. Enfoque profesional y empático para ayudarte a alcanzar tus objetivos terapéuticos.`;
  
  return {
    nombre,
    apellido,
    especialidades,
    experiencia,
    precio,
    rating,
    modalidades,
    descripcion
  };
} 