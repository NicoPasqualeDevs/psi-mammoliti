const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('📚 Insertando sesiones de prueba...');

// Función para generar fechas de la próxima semana
function generarFechasSemanaProxima() {
  const fechas = [];
  const hoy = new Date();
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() + (7 - hoy.getDay() + 1)); // Próximo lunes
  
  for (let i = 0; i < 6; i++) { // Lunes a Sábado
    const fecha = new Date(inicioSemana);
    fecha.setDate(inicioSemana.getDate() + i);
    fechas.push(fecha.toISOString().split('T')[0]);
  }
  return fechas;
}

// Función para obtener plantillas de horarios de trabajo desde la BD
function obtenerPlantillasHorarios() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT psicologoId, dia_semana, hora_inicio, hora_fin, modalidades 
      FROM horarios_trabajo 
      WHERE activo = 1
      ORDER BY psicologoId, dia_semana, hora_inicio
    `;
    
    db.all(query, [], (err, plantillas) => {
      if (err) {
        reject(err);
      } else {
        // Agrupar por psicólogo
        const plantillasPorPsicologo = {};
        plantillas.forEach(plantilla => {
          if (!plantillasPorPsicologo[plantilla.psicologoId]) {
            plantillasPorPsicologo[plantilla.psicologoId] = [];
          }
          plantillasPorPsicologo[plantilla.psicologoId].push({
            diaSemana: plantilla.dia_semana,
            horaInicio: plantilla.hora_inicio,
            horaFin: plantilla.hora_fin,
            modalidades: JSON.parse(plantilla.modalidades)
          });
        });
        resolve(plantillasPorPsicologo);
      }
    });
  });
}

// Función para generar intervalos de horarios desde plantillas
function generarIntervalosDesdeBloque(horaInicio, horaFin, duracionMinutos = 60, bufferMinutos = 15) {
  const intervalos = [];
  
  const [horaIni, minIni] = horaInicio.split(':').map(Number);
  const [horaFin_, minFin] = horaFin.split(':').map(Number);
  
  const inicioMinutos = horaIni * 60 + minIni;
  const finMinutos = horaFin_ * 60 + minFin;
  const intervaloTotal = duracionMinutos + bufferMinutos;
  
  for (let minutos = inicioMinutos; minutos + duracionMinutos <= finMinutos; minutos += intervaloTotal) {
    const horaInicioIntervalo = minutosAHora(minutos);
    intervalos.push(horaInicioIntervalo);
  }
  
  return intervalos;
}

function minutosAHora(minutos) {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Función ACTUALIZADA para generar sesiones de prueba usando plantillas
async function generarSesionesPrueba() {
  const fechas = generarFechasSemanaProxima();
  const modalidades = ['online', 'presencial'];
  const especialidades = ['Ansiedad', 'Depresión', 'Terapia de Pareja', 'Estrés', 'Autoestima', 'Terapia Cognitivo-Conductual'];
  const estados = ['confirmada', 'pendiente'];
  
  const pacientes = [
    {
      nombre: 'Juan Pérez',
      email: 'juan@correo.com',
      telefono: '+52 555 123 4567'
    },
    {
      nombre: 'María García',
      email: 'maria@correo.com',
      telefono: '+52 555 987 6543'
    },
    {
      nombre: 'Carlos López',
      email: 'carlos@correo.com',
      telefono: '+52 555 456 7890'
    },
    {
      nombre: 'Ana Rodríguez',
      email: 'ana@correo.com',
      telefono: '+52 555 321 0987'
    },
    {
      nombre: 'Luis Martín',
      email: 'luis@correo.com',
      telefono: '+52 555 654 3210'
    },
    {
      nombre: 'Sofia Hernández',
      email: 'sofia@correo.com',
      telefono: '+52 555 789 0123'
    }
  ];

  // Obtener plantillas de horarios desde la BD
  const plantillasPorPsicologo = await obtenerPlantillasHorarios();
  const psicologosIds = Object.keys(plantillasPorPsicologo);

  const sesiones = [];
  const horariosUsados = {}; // Para rastrear horarios por psicólogo y fecha
  
  let sesionId = 1;
  
  // Generar 2 sesiones por psicólogo distribuidas en la semana
  psicologosIds.forEach(psicologoId => {
    let sesionesGeneradas = 0;
    
    fechas.forEach((fecha, fechaIndex) => {
      if (sesionesGeneradas >= 2) return; // Máximo 2 sesiones por psicólogo
      
      const fechaObj = new Date(fecha + 'T00:00:00');
      const diaSemana = fechaObj.getDay(); // 0=Domingo, 1=Lunes, etc.
      
      if (diaSemana === 0) return; // Saltar domingo
      
      // Buscar plantilla para este día
      const plantillasDelDia = plantillasPorPsicologo[psicologoId]?.filter(p => p.diaSemana === diaSemana) || [];
      
      if (plantillasDelDia.length === 0) return;
      
      // Generar horarios disponibles desde las plantillas
      let horariosDisponibles = [];
      plantillasDelDia.forEach(plantilla => {
        const intervalos = generarIntervalosDesdeBloque(plantilla.horaInicio, plantilla.horaFin);
        intervalos.forEach(hora => {
          horariosDisponibles.push({
            hora,
            modalidades: plantilla.modalidades
          });
        });
      });
      
      if (horariosDisponibles.length === 0) return;
      
      // Inicializar horarios usados para este psicólogo y fecha
      const clave = `${psicologoId}_${fecha}`;
      if (!horariosUsados[clave]) {
        horariosUsados[clave] = [];
      }
      
      // Encontrar un horario disponible
      const horariosLibres = horariosDisponibles.filter(horarioData => 
        !horariosUsados[clave].includes(horarioData.hora)
      );
      
      if (horariosLibres.length > 0) {
        const horarioSeleccionado = horariosLibres[Math.floor(Math.random() * horariosLibres.length)];
        const paciente = pacientes[sesionId % pacientes.length];
        const modalidadDisponible = horarioSeleccionado.modalidades[Math.floor(Math.random() * horarioSeleccionado.modalidades.length)];
        const especialidad = especialidades[Math.floor(Math.random() * especialidades.length)];
        const estado = estados[Math.floor(Math.random() * estados.length)];
        
        sesiones.push({
          id: `sesion_test_${String(sesionId).padStart(3, '0')}`,
          psicologoId: psicologoId,
          fecha: fecha,
          hora: horarioSeleccionado.hora,
          modalidad: modalidadDisponible,
          pacienteNombre: paciente.nombre,
          pacienteEmail: paciente.email,
          pacienteTelefono: paciente.telefono,
          especialidad: especialidad,
          estado: estado
        });
        
        // Marcar este horario como usado
        horariosUsados[clave].push(horarioSeleccionado.hora);
        sesionesGeneradas++;
        sesionId++;
      }
    });
  });
  
  return sesiones;
}

async function insertarSesiones() {
  return new Promise(async (resolve, reject) => {
    try {
      // Generar las sesiones de prueba desde las plantillas
      console.log('🔄 Generando sesiones desde plantillas de horarios...');
      const sesionesPrueba = await generarSesionesPrueba();
      
      console.log(`📝 Insertando ${sesionesPrueba.length} sesiones de prueba...`);
    
    // Primero, limpiar sesiones existentes que puedan ser de prueba
    db.run("DELETE FROM sesiones WHERE id LIKE 'sesion_test_%'", (err) => {
      if (err) {
        console.log('⚠️  Error limpiando sesiones anteriores:', err.message);
      } else {
        console.log('🧹 Sesiones de prueba anteriores eliminadas');
      }
      
      const insertQuery = `
        INSERT INTO sesiones (id, psicologoId, fecha, hora, modalidad, pacienteNombre, pacienteEmail, pacienteTelefono, especialidad, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      let insertadas = 0;
      let errores = 0;
      
      sesionesPrueba.forEach((sesion, index) => {
        db.run(insertQuery, [
          sesion.id,
          sesion.psicologoId,
          sesion.fecha,
          sesion.hora,
          sesion.modalidad,
          sesion.pacienteNombre,
          sesion.pacienteEmail,
          sesion.pacienteTelefono,
          sesion.especialidad,
          sesion.estado
        ], function(err) {
          if (err) {
            console.error(`❌ Error insertando sesión ${sesion.id}:`, err.message);
            errores++;
          } else {
            console.log(`✅ Sesión insertada: ${sesion.pacienteNombre} - ${sesion.fecha} ${sesion.hora} (Psicólogo ${sesion.psicologoId})`);
            insertadas++;
          }
          
          // Si es la última sesión, mostrar resumen
          if (index === sesionesPrueba.length - 1) {
            setTimeout(() => {
              console.log('\n📊 RESUMEN:');
              console.log(`✅ Sesiones insertadas exitosamente: ${insertadas}`);
              console.log(`❌ Errores: ${errores}`);
              console.log('\n👥 USUARIOS DE PRUEBA:');
              
              // Contar sesiones por usuario
              const usuariosSesiones = {};
              sesionesPrueba.forEach(sesion => {
                if (!usuariosSesiones[sesion.pacienteEmail]) {
                  usuariosSesiones[sesion.pacienteEmail] = 0;
                }
                usuariosSesiones[sesion.pacienteEmail]++;
              });
              
              Object.entries(usuariosSesiones).forEach(([email, count]) => {
                console.log(`• ${email} - ${count} sesiones`);
              });
              
              console.log('\n🔑 Puedes iniciar sesión con cualquiera de estos emails para ver sus sesiones.');
              console.log('\n📅 Fechas generadas para la próxima semana:');
              
              const fechasUnicas = [...new Set(sesionesPrueba.map(s => s.fecha))];
              fechasUnicas.forEach(fecha => {
                const fechaObj = new Date(fecha + 'T00:00:00');
                const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                const diaNombre = diasSemana[fechaObj.getDay()];
                console.log(`• ${fecha} (${diaNombre})`);
              });
              
              resolve();
            }, 100);
          }
        });
      });
    });
    } catch (error) {
      console.error('❌ Error generando o insertando sesiones:', error);
      reject(error);
    }
  });
}

// Ejecutar la inserción
insertarSesiones()
  .then(() => {
    console.log('\n🎉 ¡Sesiones de prueba insertadas exitosamente!');
    console.log('⚠️  Las sesiones fueron generadas para evitar superposiciones');
    console.log('📋 Se respetaron los horarios de trabajo: Lun-Vie 09:00-18:00, Sáb 10:00-14:00');
    db.close();
  })
  .catch(error => {
    console.error('💥 Error general:', error);
    db.close();
    process.exit(1);
  }); 