import DatabaseService from './database';
import { psicologos } from '../data/psicologos';

export async function migrarDatosIniciales(): Promise<void> {
  const db = DatabaseService.getInstance();
  
  // Verificar si ya hay datos en la base de datos
  const psicologosExistentes = await db.obtenerPsicologos();
  
  if (psicologosExistentes.length > 0) {
    return;
  }

  // Migrar cada psicólogo
  for (let i = 0; i < psicologos.length; i++) {
    const psicologo = psicologos[i];
    await db.insertarPsicologo(psicologo);
  }
  
  // Verificar la migración
  await db.obtenerPsicologos();
  
  // Mostrar especialidades disponibles
  await db.obtenerEspecialidades();
  
  // Mostrar estadísticas
  await db.obtenerEstadisticas();
}

export async function limpiarYReimportarDatos(): Promise<void> {
  const db = DatabaseService.getInstance();
  
  await db.limpiarBaseDatos();
  
  await migrarDatosIniciales();
}

// Función para obtener estadísticas de la base de datos
export async function obtenerEstadisticasDB(): Promise<{
  totalPsicologos: number;
  totalSesiones: number;
  especialidades: string[];
}> {
  try {
    const db = DatabaseService.getInstance();
    
    const [psicologos, sesiones, especialidades] = await Promise.all([
      db.obtenerPsicologos(),
      db.obtenerSesiones(),
      db.obtenerEspecialidades()
    ]);
    
    return {
      totalPsicologos: psicologos.length,
      totalSesiones: sesiones.length,
      especialidades
    };
  } catch (error) {
    return {
      totalPsicologos: 0,
      totalSesiones: 0,
      especialidades: []
    };
  }
}

// Función para exportar datos (útil para debugging)
export async function exportarDatos() {
  const db = DatabaseService.getInstance();
  
  const [psicologos, sesiones, especialidades] = await Promise.all([
    db.obtenerPsicologos(),
    db.obtenerSesiones(),
    db.obtenerEspecialidades()
  ]);
  
  const exportData = {
    timestamp: new Date().toISOString(),
    psicologos,
    sesiones,
    especialidades,
    stats: await db.obtenerEstadisticas()
  };
  
  return exportData;
} 