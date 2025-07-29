const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Crear base de datos SQLite
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Iniciando migración de horarios extendida...');
console.log('📅 Rango: 01/06/2025 - 01/06/2026 (365 días)');

// Función para generar fechas desde 01/06/2025 hasta 01/06/2026
function generarFechas() {
  const fechas = [];
  
  // Fecha de inicio: 01/06/2025
  const fechaInicio = new Date('2025-06-01');
  // Fecha de fin: 01/06/2026
  const fechaFin = new Date('2026-06-01');
  
  const fechaActual = new Date(fechaInicio);
  
  while (fechaActual < fechaFin) {
    fechas.push(fechaActual.toISOString().split('T')[0]);
    fechaActual.setDate(fechaActual.getDate() + 1);
  }
  
  return fechas;
}

// Función para generar horarios para un día
function generarHorariosDia(fecha, horaInicio, horaFin, modalidades, intervaloMinutos = 45, bufferMinutos = 15) {
  const horarios = [];
  const [horaIni, minIni] = horaInicio.split(':').map(Number);
  const [horaFinHora, minFin] = horaFin.split(':').map(Number);
  
  const inicioMinutos = horaIni * 60 + minIni;
  const finMinutos = horaFinHora * 60 + minFin;
  const intervaloTotal = intervaloMinutos + bufferMinutos;
  
  for (let minutos = inicioMinutos; minutos + intervaloMinutos <= finMinutos; minutos += intervaloTotal) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    const horaStr = `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    
    horarios.push({
      fecha,
      hora: horaStr,
      modalidades: JSON.stringify(modalidades)
    });
  }
  
  return horarios;
}

// Función para obtener psicólogos existentes
function obtenerPsicologos() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, modalidades FROM psicologos', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map(row => ({
          id: row.id,
          modalidades: JSON.parse(row.modalidades || '[]')
        })));
      }
    });
  });
}

// Función para limpiar horarios existentes
function limpiarHorarios() {
  return new Promise((resolve, reject) => {
    console.log('🧹 Limpiando horarios existentes...');
    db.serialize(() => {
      db.run('DELETE FROM horarios', (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Horarios existentes eliminados');
          resolve();
        }
      });
    });
  });
}

// Función para insertar configuración de horarios
function insertarConfiguracionHorarios(psicologoId) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT OR REPLACE INTO configuracion_horarios 
      (psicologoId, duracion_sesion, tiempo_buffer, dias_anticipacion, zona_horaria, auto_generar)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
      psicologoId,
      60,  // 60 minutos por sesión
      15,  // 15 minutos de buffer
      30,  // 30 días de anticipación
      'America/Mexico_City',
      1    // auto generar habilitado
    ], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Función para insertar horarios de trabajo (plantilla semanal)
function insertarHorariosTrabajo(psicologoId, modalidades) {
  return new Promise((resolve, reject) => {
    const horariosSemanales = [
      // Lunes a Viernes: 9:00 - 18:00
      { diaSemana: 1, horaInicio: '09:00', horaFin: '18:00' },
      { diaSemana: 2, horaInicio: '09:00', horaFin: '18:00' },
      { diaSemana: 3, horaInicio: '09:00', horaFin: '18:00' },
      { diaSemana: 4, horaInicio: '09:00', horaFin: '18:00' },
      { diaSemana: 5, horaInicio: '09:00', horaFin: '18:00' },
      // Sábado: 10:00 - 14:00
      { diaSemana: 6, horaInicio: '10:00', horaFin: '14:00' }
    ];

    const promesas = horariosSemanales.map(horario => {
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO horarios_trabajo 
          (psicologoId, dia_semana, hora_inicio, hora_fin, modalidades, activo)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.run(query, [
          psicologoId,
          horario.diaSemana,
          horario.horaInicio,
          horario.horaFin,
          JSON.stringify(modalidades),
          1
        ], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });

    Promise.all(promesas)
      .then(() => resolve())
      .catch(reject);
  });
}

// Función para insertar horarios específicos para las próximas 4 semanas
function insertarHorariosDetallados(psicologoId, modalidades) {
  return new Promise((resolve, reject) => {
    const fechas = generarFechas();
    const horariosPromesas = [];

    fechas.forEach(fecha => {
      const fechaObj = new Date(fecha);
      const diaSemana = fechaObj.getDay(); // 0=Domingo, 1=Lunes, etc.
      
      let horarios = [];
      
      // Lunes a Viernes: 9:00 - 18:00
      if (diaSemana >= 1 && diaSemana <= 5) {
        horarios = generarHorariosDia(fecha, '09:00', '18:00', modalidades);
      }
      // Sábado: 10:00 - 14:00
      else if (diaSemana === 6) {
        horarios = generarHorariosDia(fecha, '10:00', '14:00', modalidades);
      }
      // Domingo: sin horarios
      
      // Insertar cada horario
      horarios.forEach(horario => {
        const promesa = new Promise((resolve, reject) => {
          const query = `
            INSERT INTO horarios (psicologoId, fecha, hora, modalidades, disponible)
            VALUES (?, ?, ?, ?, 1)
          `;
          
          db.run(query, [
            psicologoId,
            horario.fecha,
            horario.hora,
            horario.modalidades
          ], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
        
        horariosPromesas.push(promesa);
      });
    });

    Promise.all(horariosPromesas)
      .then(() => resolve())
      .catch(reject);
  });
}

// Función para insertar algunas excepciones de ejemplo
function insertarExcepciones(psicologoId) {
  return new Promise((resolve, reject) => {
    // Día bloqueado (vacaciones) - 15 de julio de 2025
    const fechaVacaciones = '2025-07-15';
    
    // Horario especial (medio día) - 10 de agosto de 2025
    const fechaEspecial = '2025-08-10';
    
    const excepciones = [
      {
        fecha: fechaVacaciones,
        tipo: 'bloqueado',
        motivo: 'Vacaciones programadas'
      },
      {
        fecha: fechaEspecial,
        tipo: 'horario_especial',
        horaInicio: '09:00',
        horaFin: '13:00',
        modalidades: JSON.stringify(['online']),
        motivo: 'Horario reducido'
      }
    ];

    const promesas = excepciones.map(excepcion => {
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO horarios_excepciones 
          (psicologoId, fecha, tipo, hora_inicio, hora_fin, modalidades, motivo)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(query, [
          psicologoId,
          excepcion.fecha,
          excepcion.tipo,
          excepcion.horaInicio || null,
          excepcion.horaFin || null,
          excepcion.modalidades || null,
          excepcion.motivo
        ], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });

    Promise.all(promesas)
      .then(() => resolve())
      .catch(reject);
  });
}

// Función para insertar algunas citas de ejemplo (para mostrar horarios ocupados)
function insertarCitasEjemplo(psicologoId) {
  return new Promise((resolve, reject) => {
    // Cita el 2 de junio de 2025 a las 10:00
    const fechaManana = '2025-06-02';
    
    // Cita el 3 de junio de 2025 a las 14:00
    const fechaPasadoManana = '2025-06-03';
    
    const citas = [
      {
        id: `cita_${Date.now()}_1`,
        fecha: fechaManana,
        horaInicio: '10:00',
        horaFin: '11:00',
        modalidad: 'online'
      },
      {
        id: `cita_${Date.now()}_2`,
        fecha: fechaPasadoManana,
        horaInicio: '14:00',
        horaFin: '15:00',
        modalidad: 'presencial'
      }
    ];

    const promesas = citas.map(cita => {
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO citas 
          (id, psicologoId, fecha, hora_inicio, hora_fin, modalidad, estado)
          VALUES (?, ?, ?, ?, ?, ?, 'confirmada')
        `;
        
        db.run(query, [
          cita.id,
          psicologoId,
          cita.fecha,
          cita.horaInicio,
          cita.horaFin,
          cita.modalidad
        ], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });

    Promise.all(promesas)
      .then(() => resolve())
      .catch(reject);
  });
}

// Función principal de migración
async function ejecutarMigracionHorarios() {
  try {
    // Obtener psicólogos existentes
    const psicologos = await obtenerPsicologos();
    
    if (psicologos.length === 0) {
      console.log('❌ No se encontraron psicólogos. Ejecuta primero: npm run migrate');
      db.close();
      return;
    }

    console.log(`📋 Encontrados ${psicologos.length} psicólogos`);
    
    // Limpiar horarios existentes
    await limpiarHorarios();
    
    console.log('📅 Generando horarios desde 01/06/2025 hasta 01/06/2026 (1 año completo)...');
    
    // Procesar cada psicólogo
    for (let i = 0; i < psicologos.length; i++) {
      const psicologo = psicologos[i];
      
      try {
        console.log(`⏳ Procesando psicólogo ${i + 1}/${psicologos.length} (ID: ${psicologo.id})`);
        
        // Insertar configuración base
        await insertarConfiguracionHorarios(psicologo.id);
        
        // Insertar horarios de trabajo semanales
        await insertarHorariosTrabajo(psicologo.id, psicologo.modalidades);
        
        // Insertar horarios detallados para 4 semanas
        await insertarHorariosDetallados(psicologo.id, psicologo.modalidades);
        
        // Insertar algunas excepciones
        await insertarExcepciones(psicologo.id);
        
        // Insertar algunas citas de ejemplo (solo para el primer psicólogo)
        if (i === 0) {
          await insertarCitasEjemplo(psicologo.id);
        }
        
        console.log(`✅ Completado psicólogo ${psicologo.id}`);
        
      } catch (error) {
        console.error(`❌ Error procesando psicólogo ${psicologo.id}:`, error.message);
      }
    }
    
    // Mostrar estadísticas
    console.log('\n📊 Estadísticas de horarios generados:');
    
    // Contar horarios por psicólogo
    db.all(`
      SELECT 
        p.nombre,
        p.apellido,
        COUNT(h.id) as total_horarios
      FROM psicologos p
      LEFT JOIN horarios h ON p.id = h.psicologoId
      GROUP BY p.id
    `, [], (err, stats) => {
      if (!err) {
        stats.forEach(stat => {
          console.log(`  • ${stat.nombre} ${stat.apellido}: ${stat.total_horarios} horarios`);
        });
      }
      
      // Contar total de horarios
      db.get('SELECT COUNT(*) as total FROM horarios', [], (err, total) => {
        if (!err) {
          console.log(`\n🎉 Total de horarios generados: ${total.total}`);
        }
        
        console.log('✅ Migración de horarios completada exitosamente');
        db.close();
      });
    });
    
  } catch (error) {
    console.error('❌ Error en migración de horarios:', error.message);
    db.close();
    process.exit(1);
  }
}

// Ejecutar
ejecutarMigracionHorarios(); 