const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Leer los datos de psicólogos desde el archivo TypeScript convertido
const psicologosPath = path.join(__dirname, '../src/data/psicologos-data.json');

let psicologosData;

// Intentar cargar datos desde archivo JSON, si no existe, usar datos por defecto
try {
  if (fs.existsSync(psicologosPath)) {
    psicologosData = JSON.parse(fs.readFileSync(psicologosPath, 'utf8'));
  } else {
    // Datos por defecto si no existe el archivo
    psicologosData = {
      psicologos: [
        {
          id: "psi_001_demo",
          nombre: "Ana",
          apellido: "García",
          especialidades: ["Ansiedad", "Depresión"],
          experiencia: 8,
          precio: 80,
          descripcion: "Psicóloga clínica especializada en terapia cognitivo-conductual.",
          rating: 4.8,
          imagen: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face",
          modalidades: ["online", "presencial"],
          disponibilidad: []
        },
        {
          id: "psi_002_demo",
          nombre: "Carlos",
          apellido: "Martínez",
          especialidades: ["Terapia Familiar", "Psicología Infantil"],
          experiencia: 12,
          precio: 95,
          descripcion: "Especialista en terapia familiar sistémica y psicología infantil.",
          rating: 4.9,
          imagen: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face",
          modalidades: ["online", "presencial"],
          disponibilidad: []
        }
      ]
    };
  }
} catch (error) {
  console.error('Error cargando datos:', error);
  process.exit(1);
}

// Crear base de datos SQLite
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Iniciando migración de datos...');

db.serialize(() => {
  // Verificar si ya hay datos
  db.get('SELECT COUNT(*) as count FROM psicologos', [], (err, result) => {
    if (err) {
      console.error('Error verificando datos existentes:', err);
      return;
    }

    if (result.count > 0) {
      console.log(`ℹ️  Ya existen ${result.count} psicólogos en la base de datos`);
      console.log('⏭️  Saltando migración');
      db.close();
      return;
    }

    console.log('📥 Insertando datos de psicólogos...');
    
    // Si no hay datos, insertar los psicólogos
    let insertados = 0;
    const total = psicologosData.psicologos.length;

    psicologosData.psicologos.forEach((psicologo, index) => {
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
          console.error(`❌ Error insertando psicólogo ${psicologo.nombre}:`, err);
          db.run('ROLLBACK');
          return;
        }

        // Insertar especialidades
        let especialidadesInsertadas = 0;
        const totalEspecialidades = psicologo.especialidades.length;

        psicologo.especialidades.forEach(especialidad => {
          // Insertar especialidad si no existe
          db.run('INSERT OR IGNORE INTO especialidades (nombre) VALUES (?)', [especialidad], (err) => {
            if (err) {
              console.error(`❌ Error insertando especialidad ${especialidad}:`, err);
              return;
            }
            
            // Crear relación psicólogo-especialidad
            db.run('INSERT INTO psicologo_especialidades (psicologoId, especialidad) VALUES (?, ?)', 
              [psicologo.id, especialidad], (err) => {
              if (err) {
                console.error(`❌ Error creando relación especialidad ${especialidad}:`, err);
                return;
              }
              
              especialidadesInsertadas++;
              
              // Si todas las especialidades están insertadas, insertar horarios
              if (especialidadesInsertadas === totalEspecialidades) {
                insertarHorarios(psicologo, () => {
                  db.run('COMMIT');
                  insertados++;
                  
                  console.log(`✅ Psicólogo ${psicologo.nombre} ${psicologo.apellido} insertado (${insertados}/${total})`);
                  
                  if (insertados === total) {
                    console.log('🎉 Migración completada exitosamente');
                    db.close();
                  }
                });
              }
            });
          });
        });
      });
    });
  });
});

function insertarHorarios(psicologo, callback) {
  if (!psicologo.disponibilidad || psicologo.disponibilidad.length === 0) {
    callback();
    return;
  }

  let horariosInsertados = 0;
  let totalHorarios = 0;
  
  // Contar total de horarios
  psicologo.disponibilidad.forEach(dia => {
    totalHorarios += dia.horarios.length;
  });

  if (totalHorarios === 0) {
    callback();
    return;
  }

  psicologo.disponibilidad.forEach(dia => {
    dia.horarios.forEach(horario => {
      db.run('INSERT INTO horarios (psicologoId, fecha, hora, modalidades) VALUES (?, ?, ?, ?)',
        [psicologo.id, dia.fecha, horario.hora, JSON.stringify(horario.modalidades)],
        (err) => {
          if (err) {
            console.error(`❌ Error insertando horario ${dia.fecha} ${horario.hora}:`, err);
          }
          
          horariosInsertados++;
          
          if (horariosInsertados === totalHorarios) {
            callback();
          }
        });
    });
  });
} 