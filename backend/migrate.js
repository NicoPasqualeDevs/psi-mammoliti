const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Leer los datos de psicólogos desde el archivo JSON
const psicologosPath = path.join(__dirname, '../src/data/psicologos-data.json');

let psicologosData;

try {
  if (fs.existsSync(psicologosPath)) {
    psicologosData = JSON.parse(fs.readFileSync(psicologosPath, 'utf8'));
  } else {
    console.error('❌ No se encontró el archivo de datos. Ejecuta: npm run convert-data');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error cargando datos:', error.message);
  process.exit(1);
}

// Crear base de datos SQLite
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Iniciando migración de datos...');

// Función para crear tablas
function crearTablas() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('📊 Creando tablas...');
      
      db.run(`
        CREATE TABLE IF NOT EXISTS psicologos (
          id TEXT PRIMARY KEY,
          nombre TEXT NOT NULL,
          apellido TEXT NOT NULL,
          experiencia INTEGER NOT NULL,
          precio INTEGER NOT NULL,
          imagen TEXT,
          descripcion TEXT,
          rating REAL,
          modalidades TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS especialidades (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT UNIQUE NOT NULL
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS psicologo_especialidades (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          psicologoId TEXT NOT NULL,
          especialidad TEXT NOT NULL,
          FOREIGN KEY (psicologoId) REFERENCES psicologos(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS horarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          psicologoId TEXT NOT NULL,
          fecha TEXT NOT NULL,
          hora TEXT NOT NULL,
          modalidades TEXT,
          disponible BOOLEAN DEFAULT 1,
          FOREIGN KEY (psicologoId) REFERENCES psicologos(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS sesiones (
          id TEXT PRIMARY KEY,
          psicologoId TEXT NOT NULL,
          fecha TEXT NOT NULL,
          hora TEXT NOT NULL,
          modalidad TEXT NOT NULL,
          pacienteNombre TEXT NOT NULL,
          pacienteEmail TEXT NOT NULL,
          pacienteTelefono TEXT,
          especialidad TEXT NOT NULL,
          estado TEXT DEFAULT 'confirmada',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (psicologoId) REFERENCES psicologos(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Tablas creadas exitosamente');
          resolve();
        }
      });
    });
  });
}

// Función para verificar si ya hay datos
function verificarDatos() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM psicologos', [], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.count);
      }
    });
  });
}

// Función para insertar un psicólogo
function insertarPsicologo(psicologo) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // Insertar psicólogo
      const psicologoQuery = `
        INSERT INTO psicologos (id, nombre, apellido, experiencia, precio, imagen, descripcion, rating, modalidades)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(psicologoQuery, [
        psicologo.id,
        psicologo.nombre,
        psicologo.apellido,
        psicologo.experiencia,
        psicologo.precio,
        psicologo.imagen,
        psicologo.descripcion,
        psicologo.rating,
        JSON.stringify(psicologo.modalidades)
      ], function(err) {
        if (err) {
          db.run('ROLLBACK');
          reject(err);
          return;
        }

        // Insertar especialidades
        let especialidadesPromesas = psicologo.especialidades.map(especialidad => {
          return new Promise((resolve, reject) => {
            db.run('INSERT OR IGNORE INTO especialidades (nombre) VALUES (?)', [especialidad], (err) => {
              if (err) {
                reject(err);
                return;
              }
              
              db.run('INSERT INTO psicologo_especialidades (psicologoId, especialidad) VALUES (?, ?)', 
                [psicologo.id, especialidad], (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            });
          });
        });

        Promise.all(especialidadesPromesas)
          .then(() => {
            // Insertar horarios
            if (!psicologo.disponibilidad || psicologo.disponibilidad.length === 0) {
              db.run('COMMIT');
              resolve();
              return;
            }

            let horariosPromesas = [];
            psicologo.disponibilidad.forEach(dia => {
              dia.horarios.forEach(horario => {
                const promesa = new Promise((resolve, reject) => {
                  db.run('INSERT INTO horarios (psicologoId, fecha, hora, modalidades) VALUES (?, ?, ?, ?)',
                    [psicologo.id, dia.fecha, horario.hora, JSON.stringify(horario.modalidades)],
                    (err) => {
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
              .then(() => {
                db.run('COMMIT');
                resolve();
              })
              .catch(err => {
                db.run('ROLLBACK');
                reject(err);
              });
          })
          .catch(err => {
            db.run('ROLLBACK');
            reject(err);
          });
      });
    });
  });
}

// Ejecutar migración
async function ejecutarMigracion() {
  try {
    // Crear tablas
    await crearTablas();
    
    // Verificar si ya hay datos
    const count = await verificarDatos();
    
    if (count > 0) {
      console.log(`ℹ️  Ya existen ${count} psicólogos en la base de datos`);
      console.log('⏭️  Saltando migración');
      db.close();
      return;
    }

    console.log('📥 Insertando datos de psicólogos...');
    
    // Insertar psicólogos
    for (let i = 0; i < psicologosData.psicologos.length; i++) {
      const psicologo = psicologosData.psicologos[i];
      try {
        await insertarPsicologo(psicologo);
        console.log(`✅ Psicólogo ${psicologo.nombre} ${psicologo.apellido} insertado (${i + 1}/${psicologosData.psicologos.length})`);
      } catch (error) {
        console.error(`❌ Error insertando psicólogo ${psicologo.nombre}:`, error.message);
      }
    }
    
    console.log('🎉 Migración completada exitosamente');
    db.close();
    
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    db.close();
    process.exit(1);
  }
}

// Ejecutar
ejecutarMigracion(); 