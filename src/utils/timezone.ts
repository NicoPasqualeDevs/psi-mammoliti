import { toZonedTime, format } from 'date-fns-tz';
import { parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';

export const detectarTimezone = (): string => {
  return ARGENTINA_TIMEZONE;
};

export const obtenerOffsetTimezone = (timezone: string): number => {
  const date = new Date();
  const zonedDate = toZonedTime(date, timezone);
  const offset = (zonedDate.getTime() - date.getTime()) / (1000 * 60 * 60);
  return offset;
};

// Obtener la fecha/hora actual en Argentina
export const obtenerAhoraArgentina = (): Date => {
  return toZonedTime(new Date(), ARGENTINA_TIMEZONE);
};

// Convertir una fecha local a la zona horaria de Argentina
export const convertirAArgentina = (fecha: Date): Date => {
  return toZonedTime(fecha, ARGENTINA_TIMEZONE);
};

// Generar string de fecha en formato YYYY-MM-DD para Argentina
export const obtenerFechaArgentina = (fecha?: Date): string => {
  const fechaArgentina = fecha ? convertirAArgentina(fecha) : obtenerAhoraArgentina();
  return format(fechaArgentina, 'yyyy-MM-dd', { timeZone: ARGENTINA_TIMEZONE });
};

// Obtener la semana actual basada en hora de Argentina
export const obtenerSemanaActual = (): { inicio: Date; fin: Date } => {
  const hoyArgentina = obtenerAhoraArgentina();
  
  // Obtener el lunes de esta semana (inicio de semana)
  const diaSemana = hoyArgentina.getDay(); // 0 = domingo, 1 = lunes, etc.
  const diasParaLunes = diaSemana === 0 ? -6 : 1 - diaSemana; // Si es domingo, retroceder 6 días
  
  const inicioSemana = new Date(hoyArgentina);
  inicioSemana.setDate(hoyArgentina.getDate() + diasParaLunes);
  inicioSemana.setHours(0, 0, 0, 0);
  
  // El domingo de esta semana (fin de semana)
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6);
  finSemana.setHours(23, 59, 59, 999);
  
  return {
    inicio: inicioSemana,
    fin: finSemana
  };
};

// Verificar si una fecha/hora es al menos 6 horas en el futuro (tiempo Argentina)
export const validarAnticipacionArgentina = (fechaStr: string, horaStr: string): boolean => {
  const fechaHora = parseISO(`${fechaStr}T${horaStr}`);
  const fechaHoraArgentina = convertirAArgentina(fechaHora);
  const ahoraArgentina = obtenerAhoraArgentina();
  const minimaFechaHora = new Date(ahoraArgentina.getTime() + 6 * 60 * 60 * 1000); // 6 horas después
  
  return fechaHoraArgentina >= minimaFechaHora;
};

// Verificar si una fecha es hoy en Argentina
export const esHoyArgentina = (fecha: Date): boolean => {
  const hoyArgentina = obtenerAhoraArgentina();
  return fecha.getFullYear() === hoyArgentina.getFullYear() &&
         fecha.getMonth() === hoyArgentina.getMonth() &&
         fecha.getDate() === hoyArgentina.getDate();
};

// Verificar si una fecha es pasada en Argentina
export const esPasadoArgentina = (fecha: Date): boolean => {
  const hoyArgentina = obtenerAhoraArgentina();
  const fechaCopia = new Date(fecha);
  fechaCopia.setHours(23, 59, 59, 999); // Final del día
  
  const hoyInicio = new Date(hoyArgentina);
  hoyInicio.setHours(0, 0, 0, 0); // Inicio del día
  
  return fechaCopia < hoyInicio;
};

export const convertirHorario = (hora: string): string => {
  // Para simplificar, todas las horas se muestran en hora de Buenos Aires
  const [horas, minutos] = hora.split(':').map(Number);
  const fecha = new Date();
  fecha.setHours(horas, minutos, 0, 0);
  
  return format(convertirAArgentina(fecha), 'HH:mm', { timeZone: ARGENTINA_TIMEZONE });
};

export const formatearFecha = (fecha: Date): string => {
  return format(convertirAArgentina(fecha), 'EEEE, d \'de\' MMMM', { 
    timeZone: ARGENTINA_TIMEZONE,
    locale: es
  });
};

export const formatearFechaCorta = (fecha: Date): string => {
  return format(convertirAArgentina(fecha), 'dd/MM/yyyy', { 
    timeZone: ARGENTINA_TIMEZONE 
  });
}; 