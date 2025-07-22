import Dexie, { Table } from 'dexie';
import { Psicologo, Sesion, Modalidad, HorarioDisponible } from '../types';

// Interfaces para las tablas de la base de datos
interface DBPsicologo {
  id: string;
  nombre: string;
  apellido: string;
  experiencia: number;
  precio: number;
  imagen: string;
  descripcion: string;
  rating: number;
  modalidades: string; // JSON string
  created_at?: Date;
}

interface DBEspecialidad {
  id?: number;
  nombre: string;
}

interface DBPsicologoEspecialidad {
  id?: number;
  psicologoId: string;
  especialidad: string;
}

interface DBHorario {
  id?: number;
  psicologoId: string;
  fecha: string;
  hora: string;
  modalidades: string; // JSON string
  disponible: boolean;
}

interface DBSesion {
  id: string;
  psicologoId: string;
  fecha: string;
  hora: string;
  modalidad: Modalidad;
  pacienteNombre: string;
  pacienteEmail: string;
  pacienteTelefono: string;
  especialidad: string;
  estado: 'confirmada' | 'pendiente' | 'cancelada';
  created_at?: Date;
}

// Clase de base de datos usando Dexie
class PsiConnectDB extends Dexie {
  psicologos!: Table<DBPsicologo>;
  especialidades!: Table<DBEspecialidad>;
  psicologoEspecialidades!: Table<DBPsicologoEspecialidad>;
  horarios!: Table<DBHorario>;
  sesiones!: Table<DBSesion>;

  constructor() {
    super('PsiConnectDB');
    
    this.version(1).stores({
      psicologos: 'id, nombre, apellido, precio, rating, experiencia',
      especialidades: '++id, &nombre',
      psicologoEspecialidades: '++id, psicologoId, especialidad',
      horarios: '++id, psicologoId, fecha, hora, disponible',
      sesiones: 'id, psicologoId, fecha, hora, modalidad, estado'
    });
  }
}

class DatabaseService {
  private db: PsiConnectDB;
  private static instance: DatabaseService;
  private initialized = false;

  private constructor() {
    this.db = new PsiConnectDB();
    this.inicializar();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private async inicializar() {
    await this.db.open();
    this.initialized = true;
  }

  private async asegurarInicializacion() {
    let attempts = 0;
    while (!this.initialized && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    if (!this.initialized) {
      throw new Error('No se pudo inicializar la base de datos');
    }
  }

  // Métodos para Psicólogos
  async obtenerPsicologos(): Promise<Psicologo[]> {
    await this.asegurarInicializacion();
    
    const dbPsicologos = await this.db.psicologos.toArray();
    const psicologos: Psicologo[] = [];

    for (const dbPsicologo of dbPsicologos) {
      // Obtener especialidades
      const especialidadesRelacion = await this.db.psicologoEspecialidades
        .where('psicologoId')
        .equals(dbPsicologo.id)
        .toArray();
      
      const especialidades = especialidadesRelacion.map(rel => rel.especialidad);

      // Obtener disponibilidad
      const disponibilidad = await this.obtenerDisponibilidadPsicologo(dbPsicologo.id);

      // Parsear modalidades
      const modalidades = JSON.parse(dbPsicologo.modalidades || '[]') as Modalidad[];

      psicologos.push({
        id: dbPsicologo.id,
        nombre: dbPsicologo.nombre,
        apellido: dbPsicologo.apellido,
        especialidades,
        experiencia: dbPsicologo.experiencia,
        precio: dbPsicologo.precio,
        imagen: dbPsicologo.imagen,
        descripcion: dbPsicologo.descripcion,
        rating: dbPsicologo.rating,
        modalidades,
        disponibilidad
      });
    }

    return psicologos.sort((a, b) => b.rating - a.rating);
  }

  async obtenerPsicologoPorId(id: string): Promise<Psicologo | null> {
    const psicologos = await this.obtenerPsicologos();
    return psicologos.find(p => p.id === id) || null;
  }

  private async obtenerDisponibilidadPsicologo(psicologoId: string): Promise<HorarioDisponible[]> {
    const horarios = await this.db.horarios
      .where('psicologoId')
      .equals(psicologoId)
      .and(horario => horario.disponible)
      .toArray();

    // Agrupar por fecha
    const disponibilidadMap = new Map<string, { hora: string; modalidades: Modalidad[] }[]>();
    
    horarios.forEach(horario => {
      if (!disponibilidadMap.has(horario.fecha)) {
        disponibilidadMap.set(horario.fecha, []);
      }
      
      const horarios = disponibilidadMap.get(horario.fecha);
      if (horarios) {
        horarios.push({
          hora: horario.hora,
          modalidades: JSON.parse(horario.modalidades || '[]') as Modalidad[]
        });
      }
    });

    return Array.from(disponibilidadMap.entries()).map(([fecha, horarios]) => ({
      fecha,
      horarios: horarios.sort((a, b) => a.hora.localeCompare(b.hora))
    }));
  }

  async insertarPsicologo(psicologo: Psicologo): Promise<void> {
    await this.asegurarInicializacion();

    try {
  
      
      // Validaciones previas
      if (!psicologo.id) {
        throw new Error('El psicólogo debe tener un ID válido');
      }
      
      if (!psicologo.especialidades || psicologo.especialidades.length === 0) {
        throw new Error('El psicólogo debe tener al menos una especialidad');
      }
      
      if (!psicologo.modalidades || psicologo.modalidades.length === 0) {
        throw new Error('El psicólogo debe tener al menos una modalidad');
      }

      // Verificar que no existe un psicólogo con el mismo ID
      const existente = await this.db.psicologos.get(psicologo.id);
      if (existente) {
        throw new Error(`Ya existe un psicólogo con el ID: ${psicologo.id}`);
      }

      await this.db.transaction('rw', [this.db.psicologos, this.db.especialidades, this.db.psicologoEspecialidades, this.db.horarios], async () => {
        // Insertar psicólogo
        const dbPsicologo: DBPsicologo = {
          id: psicologo.id,
          nombre: psicologo.nombre,
          apellido: psicologo.apellido,
          experiencia: psicologo.experiencia,
          precio: psicologo.precio,
          imagen: psicologo.imagen,
          descripcion: psicologo.descripcion,
          rating: psicologo.rating,
          modalidades: JSON.stringify(psicologo.modalidades),
          created_at: new Date()
        };

        await this.db.psicologos.put(dbPsicologo);
  

        // Insertar especialidades y relaciones
        for (const especialidad of psicologo.especialidades) {
          try {
            // Verificar si la especialidad ya existe
            const especialidadExistente = await this.db.especialidades
              .where('nombre')
              .equals(especialidad)
              .first();
            
            // Solo insertar si no existe
            if (!especialidadExistente) {
              await this.db.especialidades.add({ nombre: especialidad });
            }
            
            // Verificar si la relación ya existe
            const relacionExistente = await this.db.psicologoEspecialidades
              .where('psicologoId')
              .equals(psicologo.id)
              .and(rel => rel.especialidad === especialidad)
              .first();
            
            // Solo crear relación si no existe
            if (!relacionExistente) {
              await this.db.psicologoEspecialidades.add({
                psicologoId: psicologo.id,
                especialidad: especialidad
              });
            }
            
          } catch (error) {
            console.warn(`⚠️ Advertencia al procesar especialidad "${especialidad}":`, error);
            // Continuar con las demás especialidades
          }
        }


        // Insertar horarios (solo si hay disponibilidad)
        if (psicologo.disponibilidad && psicologo.disponibilidad.length > 0) {
          for (const dia of psicologo.disponibilidad) {
            for (const horario of dia.horarios) {
              try {
                await this.db.horarios.put({
                  psicologoId: psicologo.id,
                  fecha: dia.fecha,
                  hora: horario.hora,
                  modalidades: JSON.stringify(horario.modalidades),
                  disponible: true
                });
              } catch (error) {
                console.warn(`⚠️ Advertencia al insertar horario ${dia.fecha} ${horario.hora}:`, error);
                // No fallar por horarios individuales
              }
            }
          }

        } else {
          // Sin horarios de disponibilidad para insertar
        }
      });


    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

      throw new Error(`Error al insertar psicólogo: ${errorMessage}`);
    }
  }

  async actualizarPsicologo(psicologo: Psicologo): Promise<void> {
    await this.asegurarInicializacion();

    try {
  
      
      // Validaciones previas
      if (!psicologo.id) {
        throw new Error('El psicólogo debe tener un ID válido');
      }
      
      if (!psicologo.especialidades || psicologo.especialidades.length === 0) {
        throw new Error('El psicólogo debe tener al menos una especialidad');
      }
      
      if (!psicologo.modalidades || psicologo.modalidades.length === 0) {
        throw new Error('El psicólogo debe tener al menos una modalidad');
      }

      // Verificar que el psicólogo existe
      const existente = await this.db.psicologos.get(psicologo.id);
      if (!existente) {
        throw new Error(`No se encontró el psicólogo con ID: ${psicologo.id}`);
      }

      await this.db.transaction('rw', [this.db.psicologos, this.db.especialidades, this.db.psicologoEspecialidades, this.db.horarios], async () => {
        // Actualizar datos del psicólogo
        const dbPsicologo: DBPsicologo = {
          id: psicologo.id,
          nombre: psicologo.nombre,
          apellido: psicologo.apellido,
          experiencia: psicologo.experiencia,
          precio: psicologo.precio,
          imagen: psicologo.imagen,
          descripcion: psicologo.descripcion,
          rating: psicologo.rating,
          modalidades: JSON.stringify(psicologo.modalidades)
        };

        await this.db.psicologos.put(dbPsicologo);


        // Eliminar relaciones de especialidades existentes
        await this.db.psicologoEspecialidades.where('psicologoId').equals(psicologo.id).delete();

        
        // Agregar especialidades y nuevas relaciones
        for (const especialidad of psicologo.especialidades) {
          try {
            // Verificar si la especialidad ya existe
            const especialidadExistente = await this.db.especialidades
              .where('nombre')
              .equals(especialidad)
              .first();
            
            // Solo insertar si no existe
            if (!especialidadExistente) {
              await this.db.especialidades.add({ nombre: especialidad });
            }
            
            // Crear nueva relación
            await this.db.psicologoEspecialidades.add({
              psicologoId: psicologo.id,
              especialidad: especialidad
            });
            
          } catch (error) {
            console.warn(`⚠️ Advertencia al procesar especialidad "${especialidad}":`, error);
            // Continuar con las demás especialidades
          }
        }


        // Eliminar horarios existentes y agregar los nuevos
        await this.db.horarios.where('psicologoId').equals(psicologo.id).delete();

        
        // Insertar nuevos horarios (solo si hay disponibilidad)
        if (psicologo.disponibilidad && psicologo.disponibilidad.length > 0) {
          for (const dia of psicologo.disponibilidad) {
            for (const horario of dia.horarios) {
              try {
                await this.db.horarios.add({
                  psicologoId: psicologo.id,
                  fecha: dia.fecha,
                  hora: horario.hora,
                  modalidades: JSON.stringify(horario.modalidades),
                  disponible: true
                });
              } catch (error) {
                console.warn(`⚠️ Advertencia al insertar horario ${dia.fecha} ${horario.hora}:`, error);
                // No fallar por horarios individuales
              }
            }
          }
          // Nuevos horarios insertados
        } else {
          // Sin horarios de disponibilidad para insertar
        }
      });

      // Psicólogo actualizado correctamente
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al actualizar psicólogo: ${errorMessage}`);
    }
  }

  async eliminarPsicologo(id: string): Promise<void> {
    await this.asegurarInicializacion();

    await this.db.transaction('rw', [this.db.psicologos, this.db.psicologoEspecialidades, this.db.horarios, this.db.sesiones], async () => {
      // Eliminar psicólogo
      await this.db.psicologos.delete(id);
      
      // Eliminar relaciones de especialidades
      await this.db.psicologoEspecialidades.where('psicologoId').equals(id).delete();
      
      // Eliminar horarios
      await this.db.horarios.where('psicologoId').equals(id).delete();
      
      // Eliminar sesiones asociadas
      await this.db.sesiones.where('psicologoId').equals(id).delete();
    });

    // Psicólogo eliminado correctamente
  }

  // Métodos para Sesiones
  async obtenerSesiones(): Promise<Sesion[]> {
    await this.asegurarInicializacion();

    const dbSesiones = await this.db.sesiones.orderBy('fecha').reverse().toArray();
    
    return dbSesiones.map(dbSesion => ({
      id: dbSesion.id,
      psicologoId: dbSesion.psicologoId,
      fecha: dbSesion.fecha,
      hora: dbSesion.hora,
      modalidad: dbSesion.modalidad,
      paciente: {
        nombre: dbSesion.pacienteNombre,
        email: dbSesion.pacienteEmail,
        telefono: dbSesion.pacienteTelefono
      },
      especialidad: dbSesion.especialidad,
      estado: dbSesion.estado
    }));
  }

  async insertarSesion(sesion: Sesion): Promise<void> {
    await this.asegurarInicializacion();

    const dbSesion: DBSesion = {
      id: sesion.id,
      psicologoId: sesion.psicologoId,
      fecha: sesion.fecha,
      hora: sesion.hora,
      modalidad: sesion.modalidad,
      pacienteNombre: sesion.paciente.nombre,
      pacienteEmail: sesion.paciente.email,
      pacienteTelefono: sesion.paciente.telefono,
      especialidad: sesion.especialidad,
      estado: sesion.estado,
      created_at: new Date()
    };

    await this.db.sesiones.put(dbSesion);
    // Sesión insertada correctamente
  }

  async obtenerEspecialidades(): Promise<string[]> {
    await this.asegurarInicializacion();
    
    const especialidades = await this.db.especialidades.orderBy('nombre').toArray();
    return especialidades.map(esp => esp.nombre);
  }

  // Método para limpiar toda la base de datos
  async limpiarBaseDatos(): Promise<void> {
    await this.asegurarInicializacion();
    
    await this.db.transaction('rw', [this.db.psicologos, this.db.especialidades, this.db.psicologoEspecialidades, this.db.horarios, this.db.sesiones], async () => {
      await this.db.psicologos.clear();
      await this.db.especialidades.clear();
      await this.db.psicologoEspecialidades.clear();
      await this.db.horarios.clear();
      await this.db.sesiones.clear();
    });
    
    // Base de datos limpiada completamente
  }

  // Obtener estadísticas
  async obtenerEstadisticas() {
    await this.asegurarInicializacion();
    
    const [totalPsicologos, totalSesiones, totalEspecialidades] = await Promise.all([
      this.db.psicologos.count(),
      this.db.sesiones.count(),
      this.db.especialidades.count()
    ]);

    return {
      totalPsicologos,
      totalSesiones,
      totalEspecialidades
    };
  }

  // Método para obtener la instancia de Dexie (útil para desarrollo)
  getDB() {
    return this.db;
  }
}

export default DatabaseService; 