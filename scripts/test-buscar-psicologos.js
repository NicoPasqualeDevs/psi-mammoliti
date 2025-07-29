const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001/api';

async function testBuscarPsicologosDisponibles() {
  console.log('🧪 Probando endpoint de búsqueda de psicólogos disponibles\n');

  // Obtener fecha de mañana
  const mañana = new Date();
  mañana.setDate(mañana.getDate() + 1);
  const fechaMañana = mañana.toISOString().split('T')[0];

  const pruebas = [
    {
      nombre: 'Búsqueda básica - Mañana a las 10:00',
      url: `${API_BASE_URL}/disponibilidad/buscar?fecha=${fechaMañana}&hora=10:00`,
      descripcion: 'Buscar todos los psicólogos disponibles mañana a las 10 AM'
    },
    {
      nombre: 'Búsqueda con modalidad virtual',
      url: `${API_BASE_URL}/disponibilidad/buscar?fecha=${fechaMañana}&hora=14:30&modalidad=virtual`,
      descripcion: 'Buscar solo psicólogos con modalidad virtual'
    },
    {
      nombre: 'Búsqueda con modalidad presencial',
      url: `${API_BASE_URL}/disponibilidad/buscar?fecha=${fechaMañana}&hora=16:00&modalidad=presencial`,
      descripcion: 'Buscar solo psicólogos con modalidad presencial'
    },
    {
      nombre: 'Búsqueda en horario típico de almuerzo',
      url: `${API_BASE_URL}/disponibilidad/buscar?fecha=${fechaMañana}&hora=13:00`,
      descripcion: 'Verificar disponibilidad en horario de almuerzo'
    }
  ];

  // Pruebas de error
  const pruebasError = [
    {
      nombre: 'Error - Fecha inválida',
      url: `${API_BASE_URL}/disponibilidad/buscar?fecha=2024-13-45&hora=10:00`,
      descripcion: 'Probar formato de fecha inválido'
    },
    {
      nombre: 'Error - Hora inválida',
      url: `${API_BASE_URL}/disponibilidad/buscar?fecha=${fechaMañana}&hora=25:70`,
      descripcion: 'Probar formato de hora inválido'
    },
    {
      nombre: 'Error - Parámetros faltantes',
      url: `${API_BASE_URL}/disponibilidad/buscar?fecha=${fechaMañana}`,
      descripcion: 'Probar sin el parámetro hora requerido'
    }
  ];

  // Ejecutar pruebas exitosas
  console.log('📊 PRUEBAS EXITOSAS:');
  console.log('='.repeat(50));
  
  for (const prueba of pruebas) {
    try {
      console.log(`\n${prueba.nombre}`);
      console.log(`📝 ${prueba.descripcion}`);
      console.log(`🔗 ${prueba.url}`);
      
      const response = await fetch(prueba.url);
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Estado: OK');
        console.log(`📊 Psicólogos encontrados: ${data.cantidadDisponibles}`);
        
        if (data.cantidadDisponibles > 0) {
          console.log('👥 Primeros psicólogos disponibles:');
          data.psicologosDisponibles.slice(0, 2).forEach((psi, index) => {
            console.log(`   ${index + 1}. ${psi.nombre} ${psi.apellido} - $${psi.precio} MXN`);
            console.log(`      Especialidades: ${psi.especialidades.join(', ')}`);
            console.log(`      Modalidades: ${psi.modalidades.join(', ')}`);
          });
        } else {
          console.log('   ℹ️  No se encontraron psicólogos disponibles');
        }
      } else {
        console.log('❌ Error inesperado:', data.error);
      }
      
    } catch (error) {
      console.log('❌ Error de conexión:', error.message);
    }
    
    console.log('-'.repeat(40));
  }

  // Ejecutar pruebas de error
  console.log('\n\n🚨 PRUEBAS DE MANEJO DE ERRORES:');
  console.log('='.repeat(50));
  
  for (const prueba of pruebasError) {
    try {
      console.log(`\n${prueba.nombre}`);
      console.log(`📝 ${prueba.descripcion}`);
      console.log(`🔗 ${prueba.url}`);
      
      const response = await fetch(prueba.url);
      const data = await response.json();
      
      if (!response.ok) {
        console.log('✅ Error manejado correctamente');
        console.log(`📄 Mensaje: ${data.error}`);
      } else {
        console.log('❌ Debería haber retornado error');
      }
      
    } catch (error) {
      console.log('❌ Error de conexión:', error.message);
    }
    
    console.log('-'.repeat(40));
  }

  // Estadísticas de rendimiento
  console.log('\n\n⚡ PRUEBA DE RENDIMIENTO:');
  console.log('='.repeat(50));
  
  const urlRendimiento = `${API_BASE_URL}/disponibilidad/buscar?fecha=${fechaMañana}&hora=15:00`;
  const tiempos = [];
  
  for (let i = 0; i < 3; i++) {
    const inicio = Date.now();
    try {
      const response = await fetch(urlRendimiento);
      await response.json();
      const tiempo = Date.now() - inicio;
      tiempos.push(tiempo);
      console.log(`Prueba ${i + 1}: ${tiempo}ms`);
    } catch (error) {
      console.log(`Prueba ${i + 1}: Error - ${error.message}`);
    }
  }
  
  if (tiempos.length > 0) {
    const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
    console.log(`\n📊 Tiempo promedio de respuesta: ${promedio.toFixed(2)}ms`);
    console.log(`📊 Tiempo mínimo: ${Math.min(...tiempos)}ms`);
    console.log(`📊 Tiempo máximo: ${Math.max(...tiempos)}ms`);
  }

  console.log('\n🎉 Pruebas completadas!');
}

// Función para verificar si el servidor está ejecutándose
async function verificarServidor() {
  try {
    const response = await fetch(`${API_BASE_URL}/psicologos`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Ejecutar las pruebas
async function main() {
  console.log('🔍 Verificando si el servidor está ejecutándose...');
  
  const servidorActivo = await verificarServidor();
  
  if (!servidorActivo) {
    console.log('❌ El servidor no está ejecutándose en http://localhost:3001');
    console.log('🚀 Por favor, ejecute el backend con: npm start');
    process.exit(1);
  }
  
  console.log('✅ Servidor detectado, iniciando pruebas...\n');
  
  await testBuscarPsicologosDisponibles();
}

main().catch(console.error);