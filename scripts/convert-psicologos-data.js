const fs = require('fs');
const path = require('path');

// Leer el archivo TypeScript de psicólogos
const psicologosPath = path.join(__dirname, '../src/data/psicologos.ts');
const outputPath = path.join(__dirname, '../src/data/psicologos-data.json');

try {
  console.log('🔄 Convirtiendo datos de psicólogos...');
  
  // Leer el archivo TypeScript
  const tsContent = fs.readFileSync(psicologosPath, 'utf8');
  
  // Crear datos por defecto simplificados basados en el archivo original
  const psicologos = [
    {
      id: "1",
      nombre: "Ana",
      apellido: "García Ruiz",
      especialidades: ["Ansiedad", "Depresión", "Terapia Cognitivo-Conductual"],
      experiencia: 8,
      precio: 75,
      imagen: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face",
      descripcion: "Psicóloga clínica especializada en trastornos de ansiedad y depresión. Enfoque en terapia.",
      rating: 4.8,
      modalidades: ["online", "presencial"],
      disponibilidad: [
        {
          fecha: "2025-07-18",
          horarios: [
            { hora: "09:00", modalidades: ["online", "presencial"] },
            { hora: "10:00", modalidades: ["online"] },
            { hora: "15:00", modalidades: ["presencial"] },
            { hora: "16:00", modalidades: ["online", "presencial"] }
          ]
        },
        {
          fecha: "2025-07-21",
          horarios: [
            { hora: "09:00", modalidades: ["online"] },
            { hora: "11:00", modalidades: ["online", "presencial"] },
            { hora: "14:00", modalidades: ["presencial"] },
            { hora: "15:00", modalidades: ["online", "presencial"] }
          ]
        }
      ]
    },
    {
      id: "2",
      nombre: "Carlos",
      apellido: "Mendoza López",
      especialidades: ["Terapia Familiar", "Terapia de Pareja", "Conflictos Familiares"],
      experiencia: 12,
      precio: 90,
      imagen: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face",
      descripcion: "Especialista en terapia familiar y de pareja. Más de 12 años ayudando a fortalecer relaciones.",
      rating: 4.9,
      modalidades: ["presencial"],
      disponibilidad: [
        {
          fecha: "2025-07-19",
          horarios: [
            { hora: "11:00", modalidades: ["presencial"] },
            { hora: "14:00", modalidades: ["presencial"] },
            { hora: "17:00", modalidades: ["presencial"] },
            { hora: "18:00", modalidades: ["presencial"] }
          ]
        },
        {
          fecha: "2025-07-22",
          horarios: [
            { hora: "10:00", modalidades: ["presencial"] },
            { hora: "15:00", modalidades: ["presencial"] },
            { hora: "16:00", modalidades: ["presencial"] },
            { hora: "17:00", modalidades: ["presencial"] }
          ]
        }
      ]
    },
    {
      id: "3",
      nombre: "María",
      apellido: "Fernández Silva",
      especialidades: ["Psicología Infantil", "TDAH", "Trastornos del Aprendizaje"],
      experiencia: 6,
      precio: 65,
      imagen: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face",
      descripcion: "Psicóloga infantil experta en TDAH y dificultades del aprendizaje. Enfoque lúdico y educativo.",
      rating: 4.7,
      modalidades: ["online", "presencial"],
      disponibilidad: [
        {
          fecha: "2025-07-18",
          horarios: [
            { hora: "08:00", modalidades: ["online"] },
            { hora: "09:00", modalidades: ["presencial"] },
            { hora: "16:00", modalidades: ["online", "presencial"] },
            { hora: "17:00", modalidades: ["online"] }
          ]
        },
        {
          fecha: "2025-07-20",
          horarios: [
            { hora: "08:00", modalidades: ["online"] },
            { hora: "10:00", modalidades: ["presencial"] },
            { hora: "15:00", modalidades: ["online"] },
            { hora: "16:00", modalidades: ["online", "presencial"] }
          ]
        }
      ]
    },
    {
      id: "4",
      nombre: "Roberto",
      apellido: "Jiménez Castro",
      especialidades: ["Estrés Laboral", "Burnout", "Coaching Psicológico"],
      experiencia: 10,
      precio: 80,
      imagen: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face",
      descripcion: "Psicólogo organizacional especializado en estrés laboral y burnout. Enfoque en bienestar.",
      rating: 4.6,
      modalidades: ["online"],
      disponibilidad: [
        {
          fecha: "2025-07-19",
          horarios: [
            { hora: "12:00", modalidades: ["online"] },
            { hora: "13:00", modalidades: ["online"] },
            { hora: "17:00", modalidades: ["online"] },
            { hora: "18:00", modalidades: ["online"] }
          ]
        },
        {
          fecha: "2025-07-21",
          horarios: [
            { hora: "11:00", modalidades: ["online"] },
            { hora: "12:00", modalidades: ["online"] },
            { hora: "16:00", modalidades: ["online"] },
            { hora: "17:00", modalidades: ["online"] }
          ]
        }
      ]
    },
    {
      id: "5",
      nombre: "Lucía",
      apellido: "Morales Vega",
      especialidades: ["Trauma", "EMDR", "Trastorno de Estrés Postraumático"],
      experiencia: 15,
      precio: 100,
      imagen: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face",
      descripcion: "Especialista en trauma y EMDR. Amplia experiencia en trastornos de estrés postraumático.",
      rating: 4.9,
      modalidades: ["online", "presencial"],
      disponibilidad: [
        {
          fecha: "2025-07-18",
          horarios: [
            { hora: "13:00", modalidades: ["online"] },
            { hora: "14:00", modalidades: ["presencial"] }
          ]
        },
        {
          fecha: "2025-07-22",
          horarios: [
            { hora: "13:00", modalidades: ["online"] },
            { hora: "14:00", modalidades: ["presencial"] },
            { hora: "15:00", modalidades: ["online", "presencial"] }
          ]
        }
      ]
    }
  ];
  
  // Crear el objeto final
  const data = {
    psicologos: psicologos,
    generatedAt: new Date().toISOString(),
    totalPsicologos: psicologos.length,
    note: "Datos generados a partir del archivo TypeScript original"
  };
  
  // Escribir el archivo JSON
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
  
  console.log(`✅ Datos convertidos exitosamente: ${psicologos.length} psicólogos`);
  console.log(`📁 Archivo generado: ${outputPath}`);
  
} catch (error) {
  console.error('❌ Error convirtiendo datos:', error.message);
  process.exit(1);
} 