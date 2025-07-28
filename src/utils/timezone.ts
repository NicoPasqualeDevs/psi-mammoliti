export const detectarTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const obtenerOffsetTimezone = (timezone: string): number => {
  const fecha = new Date();
  const utc = fecha.getTime() + (fecha.getTimezoneOffset() * 60000);
  const fechaTimezone = new Date(utc + (getTimezoneOffset(timezone) * 3600000));
  return fechaTimezone.getTimezoneOffset() / -60;
};

const getTimezoneOffset = (timezone: string): number => {
  const offsets: { [key: string]: number } = {
    'America/New_York': -5,
    'America/Chicago': -6,
    'America/Denver': -7,
    'America/Los_Angeles': -8,
    'America/Mexico_City': -6,
    'America/Argentina/Buenos_Aires': -3,
    'America/Sao_Paulo': -3,
    'Europe/London': 0,
    'Europe/Paris': 1,
    'Europe/Madrid': 1,
    'Asia/Tokyo': 9,
    'Asia/Shanghai': 8,
    'Australia/Sydney': 10,
  };
  
  return offsets[timezone] || 0;
};

export const convertirHorario = (hora: string, timezoneOrigen: string, timezoneDestino: string): string => {
  const [horas, minutos] = hora.split(':').map(Number);
  
  const fecha = new Date();
  fecha.setHours(horas, minutos, 0, 0);
  
  const offsetOrigen = getTimezoneOffset(timezoneOrigen);
  const offsetDestino = getTimezoneOffset(timezoneDestino);
  const diferencia = offsetDestino - offsetOrigen;
  
  fecha.setHours(fecha.getHours() + diferencia);
  
  return fecha.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

export const obtenerSemanaActual = (): { inicio: Date; fin: Date } => {
  const hoy = new Date();
  const fechaInicioDisponibilidad = new Date('2025-06-01');
  const fechaFinDisponibilidad = new Date('2026-06-01');
  
  // Determinar qué fecha usar como referencia
  let fechaReferencia: Date;
  
  if (hoy < fechaInicioDisponibilidad) {
    // Si estamos antes del rango, usar la fecha de inicio
    fechaReferencia = new Date(fechaInicioDisponibilidad);
  } else if (hoy > fechaFinDisponibilidad) {
    // Si estamos después del rango, usar la fecha de inicio
    fechaReferencia = new Date(fechaInicioDisponibilidad);
  } else {
    // Si estamos dentro del rango, usar la fecha actual
    fechaReferencia = new Date(hoy);
  }
  
  // Calcular el lunes de la semana de la fecha de referencia
  const diaActual = fechaReferencia.getDay();
  const diferencia = diaActual === 0 ? -6 : 1 - diaActual; // 0=Domingo, 1=Lunes, etc.
  
  const lunes = new Date(fechaReferencia);
  lunes.setDate(fechaReferencia.getDate() + diferencia);
  lunes.setHours(0, 0, 0, 0);
  
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  domingo.setHours(23, 59, 59, 999);
  
  return { inicio: lunes, fin: domingo };
};

export const formatearFecha = (fecha: Date): string => {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
};

export const formatearFechaCorta = (fecha: Date): string => {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}; 