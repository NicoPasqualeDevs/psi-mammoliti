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

  // Tabla de configuracion_horarios
  db.run(`
    CREATE TABLE IF NOT EXISTS configuracion_horarios (
      psicologoId TEXT PRIMARY KEY,
      duracion_sesion INTEGER NOT NULL,
      tiempo_buffer INTEGER NOT NULL,
      dias_anticipacion INTEGER NOT NULL,
      zona_horaria TEXT NOT NULL,
      auto_generar INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de horarios_trabajo
  db.run(`
    CREATE TABLE IF NOT EXISTS horarios_trabajo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      psicologoId TEXT NOT NULL,
      dia_semana INTEGER NOT NULL,
      hora_inicio TEXT NOT NULL,
      hora_fin TEXT NOT NULL,
      modalidades TEXT NOT NULL,
      activo BOOLEAN DEFAULT 1,
      FOREIGN KEY (psicologoId) REFERENCES psicologos(id)
    )
  `);

  // Tabla de horarios_excepciones
  db.run(`
    CREATE TABLE IF NOT EXISTS horarios_excepciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      psicologoId TEXT NOT NULL,
      fecha TEXT NOT NULL,
      tipo TEXT NOT NULL,
      hora_inicio TEXT NOT NULL,
      hora_fin TEXT NOT NULL,
      modalidades TEXT,
      motivo TEXT,
      FOREIGN KEY (psicologoId) REFERENCES psicologos(id)
    )
  `);

  // Tabla de citas
  db.run(`
    CREATE TABLE IF NOT EXISTS citas (
      id TEXT PRIMARY KEY,
      psicologoId TEXT NOT NULL,
      fecha TEXT NOT NULL,
      hora_inicio TEXT NOT NULL,
      hora_fin TEXT NOT NULL,
      modalidad TEXT NOT NULL,
      sesionId TEXT,
      estado TEXT DEFAULT 'pendiente',
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

// NUEVOS ENDPOINTS PARA SISTEMA DE HORARIOS REALES

// === CONFIGURACIÓN DE HORARIOS ===

// Obtener configuración de horarios de un psicólogo
app.get('/api/psicologos/:id/configuracion-horarios', (req, res) => {
  const { id } = req.params;
  
  const query = 'SELECT * FROM configuracion_horarios WHERE psicologoId = ?';
  
  db.get(query, [id], (err, configuracion) => {
    if (err) {
      console.error('Error obteniendo configuración de horarios:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (!configuracion) {
      // Crear configuración por defecto
      const configPorDefecto = {
        psicologoId: id,
        duracion_sesion: 60,
        tiempo_buffer: 15,
        dias_anticipacion: 30,
        zona_horaria: 'America/Mexico_City',
        auto_generar: 1
      };
      
      const insertQuery = `
        INSERT INTO configuracion_horarios (psicologoId, duracion_sesion, tiempo_buffer, dias_anticipacion, zona_horaria, auto_generar)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(insertQuery, [
        configPorDefecto.psicologoId,
        configPorDefecto.duracion_sesion,
        configPorDefecto.tiempo_buffer,
        configPorDefecto.dias_anticipacion,
        configPorDefecto.zona_horaria,
        configPorDefecto.auto_generar
      ], function(err) {
        if (err) {
          console.error('Error creando configuración por defecto:', err);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({
          id: this.lastID,
          ...configPorDefecto
        });
      });
    } else {
      res.json(configuracion);
    }
  });
});

// Actualizar configuración de horarios
app.put('/api/psicologos/:id/configuracion-horarios', (req, res) => {
  const { id } = req.params;
  const { duracion_sesion, tiempo_buffer, dias_anticipacion, zona_horaria, auto_generar } = req.body;
  
  const query = `
    UPDATE configuracion_horarios 
    SET duracion_sesion = ?, tiempo_buffer = ?, dias_anticipacion = ?, zona_horaria = ?, auto_generar = ?, updated_at = CURRENT_TIMESTAMP
    WHERE psicologoId = ?
  `;
  
  db.run(query, [duracion_sesion, tiempo_buffer, dias_anticipacion, zona_horaria, auto_generar, id], function(err) {
    if (err) {
      console.error('Error actualizando configuración:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    
    res.json({ message: 'Configuración actualizada exitosamente' });
  });
});

// === HORARIOS DE TRABAJO ===

// Obtener horarios de trabajo de un psicólogo
app.get('/api/psicologos/:id/horarios-trabajo', (req, res) => {
  const { id } = req.params;
  
  const query = 'SELECT * FROM horarios_trabajo WHERE psicologoId = ? ORDER BY dia_semana, hora_inicio';
  
  db.all(query, [id], (err, horarios) => {
    if (err) {
      console.error('Error obteniendo horarios de trabajo:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    const horariosFormateados = horarios.map(horario => ({
      ...horario,
      modalidades: JSON.parse(horario.modalidades)
    }));
    
    res.json(horariosFormateados);
  });
});

// Crear horario de trabajo
app.post('/api/psicologos/:id/horarios-trabajo', (req, res) => {
  const { id } = req.params;
  const { dia_semana, hora_inicio, hora_fin, modalidades, activo = true } = req.body;
  
  const query = `
    INSERT INTO horarios_trabajo (psicologoId, dia_semana, hora_inicio, hora_fin, modalidades, activo)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [id, dia_semana, hora_inicio, hora_fin, JSON.stringify(modalidades), activo], function(err) {
    if (err) {
      console.error('Error creando horario de trabajo:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.status(201).json({ 
      id: this.lastID,
      message: 'Horario de trabajo creado exitosamente' 
    });
  });
});

// Actualizar horario de trabajo
app.put('/api/horarios-trabajo/:horarioId', (req, res) => {
  const { horarioId } = req.params;
  const { dia_semana, hora_inicio, hora_fin, modalidades, activo } = req.body;
  
  const query = `
    UPDATE horarios_trabajo 
    SET dia_semana = ?, hora_inicio = ?, hora_fin = ?, modalidades = ?, activo = ?
    WHERE id = ?
  `;
  
  db.run(query, [dia_semana, hora_inicio, hora_fin, JSON.stringify(modalidades), activo, horarioId], function(err) {
    if (err) {
      console.error('Error actualizando horario de trabajo:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }
    
    res.json({ message: 'Horario actualizado exitosamente' });
  });
});

// Eliminar horario de trabajo
app.delete('/api/horarios-trabajo/:horarioId', (req, res) => {
  const { horarioId } = req.params;
  
  db.run('DELETE FROM horarios_trabajo WHERE id = ?', [horarioId], function(err) {
    if (err) {
      console.error('Error eliminando horario de trabajo:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }
    
    res.json({ message: 'Horario eliminado exitosamente' });
  });
});

// === EXCEPCIONES DE HORARIOS ===

// Obtener excepciones de un psicólogo
app.get('/api/psicologos/:id/horarios-excepciones', (req, res) => {
  const { id } = req.params;
  
  const query = 'SELECT * FROM horarios_excepciones WHERE psicologoId = ? ORDER BY fecha';
  
  db.all(query, [id], (err, excepciones) => {
    if (err) {
      console.error('Error obteniendo excepciones:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    const excepcionesFormateadas = excepciones.map(exc => ({
      ...exc,
      modalidades: exc.modalidades ? JSON.parse(exc.modalidades) : null
    }));
    
    res.json(excepcionesFormateadas);
  });
});

// Crear excepción de horario
app.post('/api/psicologos/:id/horarios-excepciones', (req, res) => {
  const { id } = req.params;
  const { fecha, tipo, hora_inicio, hora_fin, modalidades, motivo } = req.body;
  
  const query = `
    INSERT INTO horarios_excepciones (psicologoId, fecha, tipo, hora_inicio, hora_fin, modalidades, motivo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [
    id, 
    fecha, 
    tipo, 
    hora_inicio, 
    hora_fin, 
    modalidades ? JSON.stringify(modalidades) : null, 
    motivo
  ], function(err) {
    if (err) {
      console.error('Error creando excepción:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.status(201).json({ 
      id: this.lastID,
      message: 'Excepción creada exitosamente' 
    });
  });
});

// Eliminar excepción
app.delete('/api/horarios-excepciones/:excepcionId', (req, res) => {
  const { excepcionId } = req.params;
  
  db.run('DELETE FROM horarios_excepciones WHERE id = ?', [excepcionId], function(err) {
    if (err) {
      console.error('Error eliminando excepción:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Excepción no encontrada' });
    }
    
    res.json({ message: 'Excepción eliminada exitosamente' });
  });
});

// === DISPONIBILIDAD EN TIEMPO REAL (SIMPLIFICADA) ===

// Generar disponibilidad para un psicólogo en un rango de fechas basado en plantilla semanal
app.get('/api/psicologos/:id/disponibilidad', (req, res) => {
  const { id } = req.params;
  const { fecha_inicio, fecha_fin } = req.query;
  
  if (!fecha_inicio || !fecha_fin) {
    return res.status(400).json({ error: 'Se requieren fecha_inicio y fecha_fin' });
  }
  
  // Obtener configuración
  const configQuery = 'SELECT * FROM configuracion_horarios WHERE psicologoId = ?';
  
  db.get(configQuery, [id], (err, configuracion) => {
    if (err) {
      console.error('Error obteniendo configuración:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    // Usar configuración por defecto si no existe
    const config = configuracion || {
      duracion_sesion: 60,
      tiempo_buffer: 15,
      zona_horaria: 'America/Mexico_City'
    };
    
    // Obtener plantilla semanal activa
    const plantillaQuery = 'SELECT * FROM horarios_trabajo WHERE psicologoId = ? AND activo = 1 ORDER BY dia_semana';
    
    db.all(plantillaQuery, [id], (err, plantillaSemanal) => {
      if (err) {
        console.error('Error obteniendo plantilla semanal:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (!plantillaSemanal || plantillaSemanal.length === 0) {
        return res.json([]); // Sin plantilla, sin horarios
      }
      
      // Obtener citas agendadas para evitar conflictos
      const citasQuery = 'SELECT * FROM citas WHERE psicologoId = ? AND fecha BETWEEN ? AND ? AND estado = "confirmada"';
      
      db.all(citasQuery, [id, fecha_inicio, fecha_fin], (err, citas) => {
        if (err) {
          console.error('Error obteniendo citas:', err);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        // Generar disponibilidad basada en plantilla semanal
        const disponibilidad = generarDisponibilidadDesdePlantilla(
          fecha_inicio,
          fecha_fin,
          plantillaSemanal,
          citas,
          config
        );
        
        res.json(disponibilidad);
      });
    });
  });
});

// === FUNCIONES AUXILIARES SIMPLIFICADAS ===

function generarDisponibilidadDesdePlantilla(fechaInicio, fechaFin, plantillaSemanal, citasAgendadas, configuracion) {
  const resultado = [];
  const fechaActual = new Date(fechaInicio);
  const fechaLimite = new Date(fechaFin);

  while (fechaActual <= fechaLimite) {
    const fechaStr = fechaActual.toISOString().split('T')[0];
    const diaSemana = fechaActual.getDay(); // 0=Domingo, 1=Lunes, etc.
    
    // Buscar configuración para este día de la semana
    const configuracionDia = plantillaSemanal.find(p => p.dia_semana === diaSemana);
    
    let horariosDelDia = [];
    
    if (configuracionDia) {
      // Generar horarios para este día basado en la plantilla
      const modalidades = JSON.parse(configuracionDia.modalidades);
      const intervalos = generarIntervalosHorario(
        configuracionDia.hora_inicio,
        configuracionDia.hora_fin,
        configuracion.duracion_sesion,
        configuracion.tiempo_buffer
      );
      
      // Filtrar horarios ocupados
      const citasDelDia = citasAgendadas.filter(cita => cita.fecha === fechaStr);
      
      horariosDelDia = intervalos
        .filter(intervalo => {
          // Verificar si está ocupado
          return !citasDelDia.some(cita => 
            hayConflictoHorario(
              intervalo.hora_inicio,
              intervalo.hora_fin,
              cita.hora_inicio,
              cita.hora_fin
            )
          );
        })
        .map(intervalo => ({
          hora: intervalo.hora_inicio,
          modalidades: modalidades
        }));
    }

    resultado.push({
      fecha: fechaStr,
      horarios: horariosDelDia
    });

    // Avanzar al siguiente día
    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  return resultado;
}

function generarIntervalosHorario(horaInicio, horaFin, duracionMinutos, bufferMinutos) {
  const intervalos = [];
  
  const [horaIni, minIni] = horaInicio.split(':').map(Number);
  const [horaFin_, minFin] = horaFin.split(':').map(Number);
  
  const inicioMinutos = horaIni * 60 + minIni;
  const finMinutos = horaFin_ * 60 + minFin;
  const intervaloTotal = duracionMinutos + bufferMinutos;
  
  for (let minutos = inicioMinutos; minutos + duracionMinutos <= finMinutos; minutos += intervaloTotal) {
    const horaInicioIntervalo = minutosAHora(minutos);
    const horaFinIntervalo = minutosAHora(minutos + duracionMinutos);
    
    intervalos.push({
      hora_inicio: horaInicioIntervalo,
      hora_fin: horaFinIntervalo
    });
  }
  
  return intervalos;
}

function minutosAHora(minutos) {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function hayConflictoHorario(inicio1, fin1, inicio2, fin2) {
  const [h1i, m1i] = inicio1.split(':').map(Number);
  const [h1f, m1f] = fin1.split(':').map(Number);
  const [h2i, m2i] = inicio2.split(':').map(Number);
  const [h2f, m2f] = fin2.split(':').map(Number);
  
  const min1i = h1i * 60 + m1i;
  const min1f = h1f * 60 + m1f;
  const min2i = h2i * 60 + m2i;
  const min2f = h2f * 60 + m2f;
  
  return min1i < min2f && min2i < min1f;
}

// === CITAS ===

// Crear cita (al agendar sesión)
app.post('/api/citas', (req, res) => {
  const { psicologoId, fecha, hora_inicio, hora_fin, modalidad, sesionId } = req.body;
  const citaId = `cita_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const query = `
    INSERT INTO citas (id, psicologoId, fecha, hora_inicio, hora_fin, modalidad, sesionId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [citaId, psicologoId, fecha, hora_inicio, hora_fin, modalidad, sesionId], function(err) {
    if (err) {
      console.error('Error creando cita:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.status(201).json({ 
      id: citaId,
      message: 'Cita creada exitosamente' 
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