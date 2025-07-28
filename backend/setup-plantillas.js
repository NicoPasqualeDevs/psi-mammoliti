const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Configurando plantillas semanales para psicólogos...');

async function configurarPlantillas() {
  return new Promise((resolve, reject) => {
    // Obtener todos los psicólogos
    db.all('SELECT id, modalidades FROM psicologos', [], (err, psicologos) => {
      if (err) {
        reject(err);
        return;
      }

      console.log(`📋 Encontrados ${psicologos.length} psicólogos`);

      const promesas = psicologos.map(psicologo => {
        return configurarPsicologoCompleto(psicologo);
      });

      Promise.all(promesas)
        .then(() => {
          console.log('✅ Configuración completada para todos los psicólogos');
          resolve();
        })
        .catch(reject);
    });
  });
}

function configurarPsicologoCompleto(psicologo) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`⚙️  Configurando ${psicologo.id}...`);
      
      const modalidades = JSON.parse(psicologo.modalidades || '["online", "presencial"]');
      
      // 1. Insertar configuración general
      await insertarConfiguracion(psicologo.id);
      
      // 2. Verificar si ya tiene plantilla semanal
      const tieneHorarios = await verificarHorariosTrabajo(psicologo.id);
      
      if (!tieneHorarios) {
        // 3. Insertar plantilla semanal
        await insertarPlantillaSemanal(psicologo.id, modalidades);
        console.log(`✅ Plantilla creada para ${psicologo.id}`);
      } else {
        console.log(`ℹ️  ${psicologo.id} ya tiene plantilla semanal`);
      }
      
      resolve();
    } catch (error) {
      console.error(`❌ Error configurando ${psicologo.id}:`, error);
      reject(error);
    }
  });
}

function insertarConfiguracion(psicologoId) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT OR REPLACE INTO configuracion_horarios 
      (psicologoId, duracion_sesion, tiempo_buffer, dias_anticipacion, zona_horaria, auto_generar)
      VALUES (?, 60, 15, 30, 'America/Mexico_City', 1)
    `;
    
    db.run(query, [psicologoId], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function verificarHorariosTrabajo(psicologoId) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT COUNT(*) as count FROM horarios_trabajo WHERE psicologoId = ?';
    
    db.get(query, [psicologoId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.count > 0);
      }
    });
  });
}

function insertarPlantillaSemanal(psicologoId, modalidades) {
  return new Promise((resolve, reject) => {
    const plantilla = [
      // Lunes a Viernes: 9:00 - 18:00
      { dia: 1, inicio: '09:00', fin: '18:00' },
      { dia: 2, inicio: '09:00', fin: '18:00' },
      { dia: 3, inicio: '09:00', fin: '18:00' },
      { dia: 4, inicio: '09:00', fin: '18:00' },
      { dia: 5, inicio: '09:00', fin: '18:00' },
      // Sábado: 10:00 - 14:00
      { dia: 6, inicio: '10:00', fin: '14:00' }
    ];

    const promesas = plantilla.map(horario => {
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO horarios_trabajo 
          (psicologoId, dia_semana, hora_inicio, hora_fin, modalidades, activo)
          VALUES (?, ?, ?, ?, ?, 1)
        `;
        
        db.run(query, [
          psicologoId,
          horario.dia,
          horario.inicio,
          horario.fin,
          JSON.stringify(modalidades)
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

// Ejecutar configuración
configurarPlantillas()
  .then(() => {
    console.log('🎉 Configuración de plantillas completada');
    db.close();
  })
  .catch(error => {
    console.error('❌ Error en configuración:', error);
    db.close();
    process.exit(1);
  }); 