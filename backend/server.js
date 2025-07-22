const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Crear base de datos SQLite
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Crear tablas si no existen
db.serialize(() => {
  // Tabla de psicólogos
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

  // Tabla de especialidades
  db.run(`
    CREATE TABLE IF NOT EXISTS especialidades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE NOT NULL
    )
  `);

  // Tabla de relación psicólogo-especialidad
  db.run(`
    CREATE TABLE IF NOT EXISTS psicologo_especialidades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      psicologoId TEXT NOT NULL,
      especialidad TEXT NOT NULL,
      FOREIGN KEY (psicologoId) REFERENCES psicologos(id)
    )
  `);

  // Tabla de horarios
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

  // Tabla de sesiones
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
  `);
});

// ENDPOINTS API

// Obtener todos los psicólogos
app.get('/api/psicologos', (req, res) => {
  const query = `
    SELECT 
      p.*,
      GROUP_CONCAT(pe.especialidad) as especialidades
    FROM psicologos p
    LEFT JOIN psicologo_especialidades pe ON p.id = pe.psicologoId
    GROUP BY p.id
    ORDER BY p.rating DESC
  `;
  
  db.all(query, [], (err, psicologos) => {
    if (err) {
      console.error('Error obteniendo psicólogos:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    // Obtener horarios para cada psicólogo
    const promesas = psicologos.map(psicologo => {
      return new Promise((resolve) => {
        const horarioQuery = `
          SELECT fecha, hora, modalidades 
          FROM horarios 
          WHERE psicologoId = ? AND disponible = 1
          ORDER BY fecha, hora
        `;
        
        db.all(horarioQuery, [psicologo.id], (err, horarios) => {
          if (err) {
            console.error('Error obteniendo horarios:', err);
            resolve({
              ...psicologo,
              especialidades: psicologo.especialidades ? psicologo.especialidades.split(',') : [],
              modalidades: JSON.parse(psicologo.modalidades || '[]'),
              disponibilidad: []
            });
            return;
          }

          // Agrupar horarios por fecha
          const disponibilidadMap = {};
          horarios.forEach(horario => {
            if (!disponibilidadMap[horario.fecha]) {
              disponibilidadMap[horario.fecha] = [];
            }
            disponibilidadMap[horario.fecha].push({
              hora: horario.hora,
              modalidades: JSON.parse(horario.modalidades || '[]')
            });
          });

          const disponibilidad = Object.entries(disponibilidadMap).map(([fecha, horarios]) => ({
            fecha,
            horarios
          }));

          resolve({
            ...psicologo,
            especialidades: psicologo.especialidades ? psicologo.especialidades.split(',') : [],
            modalidades: JSON.parse(psicologo.modalidades || '[]'),
            disponibilidad
          });
        });
      });
    });

    Promise.all(promesas).then(psicologosCompletos => {
      res.json(psicologosCompletos);
    });
  });
});

// Obtener un psicólogo por ID
app.get('/api/psicologos/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      p.*,
      GROUP_CONCAT(pe.especialidad) as especialidades
    FROM psicologos p
    LEFT JOIN psicologo_especialidades pe ON p.id = pe.psicologoId
    WHERE p.id = ?
    GROUP BY p.id
  `;
  
  db.get(query, [id], (err, psicologo) => {
    if (err) {
      console.error('Error obteniendo psicólogo:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (!psicologo) {
      return res.status(404).json({ error: 'Psicólogo no encontrado' });
    }

    // Obtener horarios
    const horarioQuery = `
      SELECT fecha, hora, modalidades 
      FROM horarios 
      WHERE psicologoId = ? AND disponible = 1
      ORDER BY fecha, hora
    `;
    
    db.all(horarioQuery, [id], (err, horarios) => {
      if (err) {
        console.error('Error obteniendo horarios:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      // Agrupar horarios por fecha
      const disponibilidadMap = {};
      horarios.forEach(horario => {
        if (!disponibilidadMap[horario.fecha]) {
          disponibilidadMap[horario.fecha] = [];
        }
        disponibilidadMap[horario.fecha].push({
          hora: horario.hora,
          modalidades: JSON.parse(horario.modalidades || '[]')
        });
      });

      const disponibilidad = Object.entries(disponibilidadMap).map(([fecha, horarios]) => ({
        fecha,
        horarios
      }));

      res.json({
        ...psicologo,
        especialidades: psicologo.especialidades ? psicologo.especialidades.split(',') : [],
        modalidades: JSON.parse(psicologo.modalidades || '[]'),
        disponibilidad
      });
    });
  });
});

// Crear nuevo psicólogo
app.post('/api/psicologos', (req, res) => {
  const psicologo = req.body;
  
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
        console.error('Error insertando psicólogo:', err);
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Error al crear psicólogo' });
      }

      // Insertar especialidades
      const especialidadPromesas = psicologo.especialidades.map(especialidad => {
        return new Promise((resolve, reject) => {
          // Insertar especialidad si no existe
          db.run('INSERT OR IGNORE INTO especialidades (nombre) VALUES (?)', [especialidad], (err) => {
            if (err) {
              reject(err);
              return;
            }
            
            // Crear relación psicólogo-especialidad
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

      Promise.all(especialidadPromesas)
        .then(() => {
          // Insertar horarios si existen
          if (psicologo.disponibilidad && psicologo.disponibilidad.length > 0) {
            const horarioPromesas = [];
            
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
                horarioPromesas.push(promesa);
              });
            });

            Promise.all(horarioPromesas)
              .then(() => {
                db.run('COMMIT');
                res.status(201).json({ message: 'Psicólogo creado exitosamente' });
              })
              .catch(err => {
                console.error('Error insertando horarios:', err);
                db.run('ROLLBACK');
                res.status(500).json({ error: 'Error al crear horarios' });
              });
          } else {
            db.run('COMMIT');
            res.status(201).json({ message: 'Psicólogo creado exitosamente' });
          }
        })
        .catch(err => {
          console.error('Error insertando especialidades:', err);
          db.run('ROLLBACK');
          res.status(500).json({ error: 'Error al crear especialidades' });
        });
    });
  });
});

// Actualizar psicólogo
app.put('/api/psicologos/:id', (req, res) => {
  const { id } = req.params;
  const psicologo = req.body;
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Actualizar psicólogo
    const psicologoQuery = `
      UPDATE psicologos 
      SET nombre = ?, apellido = ?, experiencia = ?, precio = ?, imagen = ?, descripcion = ?, rating = ?, modalidades = ?
      WHERE id = ?
    `;
    
    db.run(psicologoQuery, [
      psicologo.nombre,
      psicologo.apellido,
      psicologo.experiencia,
      psicologo.precio,
      psicologo.imagen,
      psicologo.descripcion,
      psicologo.rating,
      JSON.stringify(psicologo.modalidades),
      id
    ], (err) => {
      if (err) {
        console.error('Error actualizando psicólogo:', err);
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Error al actualizar psicólogo' });
      }

      // Eliminar especialidades anteriores
      db.run('DELETE FROM psicologo_especialidades WHERE psicologoId = ?', [id], (err) => {
        if (err) {
          console.error('Error eliminando especialidades:', err);
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Error al actualizar especialidades' });
        }

        // Insertar nuevas especialidades
        const especialidadPromesas = psicologo.especialidades.map(especialidad => {
          return new Promise((resolve, reject) => {
            db.run('INSERT OR IGNORE INTO especialidades (nombre) VALUES (?)', [especialidad], (err) => {
              if (err) {
                reject(err);
                return;
              }
              
              db.run('INSERT INTO psicologo_especialidades (psicologoId, especialidad) VALUES (?, ?)', 
                [id, especialidad], (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            });
          });
        });

        Promise.all(especialidadPromesas)
          .then(() => {
            db.run('COMMIT');
            res.json({ message: 'Psicólogo actualizado exitosamente' });
          })
          .catch(err => {
            console.error('Error insertando especialidades:', err);
            db.run('ROLLBACK');
            res.status(500).json({ error: 'Error al actualizar especialidades' });
          });
      });
    });
  });
});

// Eliminar psicólogo
app.delete('/api/psicologos/:id', (req, res) => {
  const { id } = req.params;
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Eliminar en orden: horarios, especialidades, sesiones, psicólogo
    db.run('DELETE FROM horarios WHERE psicologoId = ?', [id], (err) => {
      if (err) {
        console.error('Error eliminando horarios:', err);
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Error al eliminar psicólogo' });
      }
      
      db.run('DELETE FROM psicologo_especialidades WHERE psicologoId = ?', [id], (err) => {
        if (err) {
          console.error('Error eliminando especialidades:', err);
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Error al eliminar psicólogo' });
        }
        
        db.run('DELETE FROM sesiones WHERE psicologoId = ?', [id], (err) => {
          if (err) {
            console.error('Error eliminando sesiones:', err);
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Error al eliminar psicólogo' });
          }
          
          db.run('DELETE FROM psicologos WHERE id = ?', [id], (err) => {
            if (err) {
              console.error('Error eliminando psicólogo:', err);
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Error al eliminar psicólogo' });
            }
            
            db.run('COMMIT');
            res.json({ message: 'Psicólogo eliminado exitosamente' });
          });
        });
      });
    });
  });
});

// Obtener todas las sesiones
app.get('/api/sesiones', (req, res) => {
  const query = `
    SELECT * FROM sesiones 
    ORDER BY fecha DESC, hora DESC
  `;
  
  db.all(query, [], (err, sesiones) => {
    if (err) {
      console.error('Error obteniendo sesiones:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    const sesionesFormateadas = sesiones.map(sesion => ({
      id: sesion.id,
      psicologoId: sesion.psicologoId,
      fecha: sesion.fecha,
      hora: sesion.hora,
      modalidad: sesion.modalidad,
      paciente: {
        nombre: sesion.pacienteNombre,
        email: sesion.pacienteEmail,
        telefono: sesion.pacienteTelefono
      },
      especialidad: sesion.especialidad,
      estado: sesion.estado
    }));
    
    res.json(sesionesFormateadas);
  });
});

// Crear nueva sesión
app.post('/api/sesiones', (req, res) => {
  const sesion = req.body;
  const id = `sesion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const query = `
    INSERT INTO sesiones (id, psicologoId, fecha, hora, modalidad, pacienteNombre, pacienteEmail, pacienteTelefono, especialidad, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [
    id,
    sesion.psicologoId,
    sesion.fecha,
    sesion.hora,
    sesion.modalidad,
    sesion.paciente.nombre,
    sesion.paciente.email,
    sesion.paciente.telefono,
    sesion.especialidad,
    'confirmada'
  ], function(err) {
    if (err) {
      console.error('Error creando sesión:', err);
      return res.status(500).json({ error: 'Error al crear sesión' });
    }
    
    res.status(201).json({ id, message: 'Sesión creada exitosamente' });
  });
});

// Obtener especialidades únicas
app.get('/api/especialidades', (req, res) => {
  const query = 'SELECT DISTINCT nombre FROM especialidades ORDER BY nombre';
  
  db.all(query, [], (err, especialidades) => {
    if (err) {
      console.error('Error obteniendo especialidades:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.json(especialidades.map(esp => esp.nombre));
  });
});

// Obtener estadísticas
app.get('/api/stats', (req, res) => {
  const queries = {
    psicologos: 'SELECT COUNT(*) as count FROM psicologos',
    sesiones: 'SELECT COUNT(*) as count FROM sesiones',
    especialidades: 'SELECT COUNT(*) as count FROM especialidades'
  };
  
  const stats = {};
  let completed = 0;
  
  Object.entries(queries).forEach(([key, query]) => {
    db.get(query, [], (err, result) => {
      if (err) {
        console.error(`Error obteniendo estadística ${key}:`, err);
        stats[key] = 0;
      } else {
        stats[key] = result.count;
      }
      
      completed++;
      if (completed === Object.keys(queries).length) {
        res.json({
          totalPsicologos: stats.psicologos,
          totalSesiones: stats.sesiones,
          especialidadesUnicas: stats.especialidades
        });
      }
    });
  });
});

// Limpiar base de datos
app.post('/api/reset', (req, res) => {
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    const queries = [
      'DELETE FROM horarios',
      'DELETE FROM psicologo_especialidades',
      'DELETE FROM sesiones',
      'DELETE FROM psicologos',
      'DELETE FROM especialidades'
    ];
    
    let completed = 0;
    
    queries.forEach(query => {
      db.run(query, (err) => {
        if (err) {
          console.error('Error en reset:', err);
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Error al limpiar base de datos' });
        }
        
        completed++;
        if (completed === queries.length) {
          db.run('COMMIT');
          res.json({ message: 'Base de datos limpiada exitosamente' });
        }
      });
    });
  });
});

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`);
  console.log(`📁 Base de datos SQLite: ${dbPath}`);
});

module.exports = app; 