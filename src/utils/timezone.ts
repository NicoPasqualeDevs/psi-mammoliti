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
  const diaActual = hoy.getDay();
  const diferencia = diaActual === 0 ? -6 : 1 - diaActual;
  
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diferencia);
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