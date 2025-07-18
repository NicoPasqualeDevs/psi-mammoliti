const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const documentContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentación Técnica - Implementación de Modalidades</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #8475b3;
        }
        
        .header h1 {
            color: #8475b3;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            color: #666;
            font-size: 1.2rem;
            font-style: italic;
        }
        
        .version-info {
            background: #f3efff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #8475b3;
        }
        
        h2 {
            color: #8475b3;
            font-size: 1.8rem;
            margin: 30px 0 15px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #f188a6;
        }
        
        h3 {
            color: #4a3d73;
            font-size: 1.3rem;
            margin: 25px 0 10px 0;
        }
        
        h4 {
            color: #665090;
            font-size: 1.1rem;
            margin: 20px 0 8px 0;
        }
        
        p {
            margin-bottom: 12px;
            text-align: justify;
        }
        
        .change-box {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
            border-left: 4px solid #f188a6;
        }
        
        .before-after {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        
        .before, .after {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
        }
        
        .before {
            border-left: 4px solid #dc3545;
        }
        
        .after {
            border-left: 4px solid #28a745;
        }
        
        .before h5 {
            color: #dc3545;
            margin-bottom: 10px;
        }
        
        .after h5 {
            color: #28a745;
            margin-bottom: 10px;
        }
        
        .code-block {
            background: #282c34;
            color: #abb2bf;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.9rem;
            margin: 10px 0;
        }
        
        .highlight {
            background: #fff3cd;
            padding: 2px 4px;
            border-radius: 3px;
            border: 1px solid #ffeeba;
        }
        
        .success-box {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        
        .success-box::before {
            content: "✅ Resultado: ";
            font-weight: bold;
            color: #155724;
        }
        
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .feature-card {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .feature-card h4 {
            color: #8475b3;
            margin-bottom: 10px;
        }
        
        .tech-spec {
            background: #e8f4fd;
            border: 1px solid #b8daff;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        
        .tech-spec::before {
            content: "⚙️ Especificación Técnica: ";
            font-weight: bold;
            color: #0c5460;
        }
        
        ul {
            margin: 10px 0 10px 20px;
        }
        
        li {
            margin-bottom: 8px;
        }
        
        .emoji {
            font-size: 1.2rem;
            margin-right: 8px;
        }
        
        .table-container {
            overflow-x: auto;
            margin: 20px 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        
        th {
            background: #8475b3;
            color: white;
            font-weight: bold;
        }
        
        tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #8475b3;
            text-align: center;
            color: #666;
        }
        
        @media print {
            body { margin: 20px; }
            .change-box, .success-box, .tech-spec { break-inside: avoid; }
            .before-after { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧠 PsiConnect</h1>
        <p class="subtitle">Documentación Técnica - Implementación de Modalidades Online/Presencial</p>
    </div>

    <div class="version-info">
        <strong>Implementación:</strong> Sistema de Modalidades v2.0<br>
        <strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}<br>
                 <strong>Desarrollador:</strong> PSI Connect Agent v 0.1<br>
                 <strong>Alcance:</strong> Funcionalidades para modalidades presenciales u online de los terapeutas
    </div>

    <h2>📋 Resumen Ejecutivo</h2>
    
    <p>Este documento detalla la implementación completa del sistema de modalidades en PsiConnect, permitiendo que los usuarios distingan entre sesiones <strong>online</strong> (💻) y <strong>presenciales</strong> (🏢). La implementación abarca desde cambios en los tipos de datos hasta mejoras en la experiencia de usuario.</p>

    <div class="success-box">
        Se han implementado exitosamente todas las funcionalidades solicitadas: filtrado por modalidad, visualización clara en el listado, y gestión granular de horarios por modalidad específica.
    </div>

    <h2>🎯 Objetivos Cumplidos</h2>

    <div class="feature-grid">
        <div class="feature-card">
            <h4>✅ Mostrar Modalidades en Listado</h4>
            <p>Cada psicólogo muestra claramente sus modalidades disponibles con iconos distintivos 💻🏢</p>
        </div>
        
        <div class="feature-card">
            <h4>✅ Filtrado por Modalidad</h4>
            <p>Panel de filtros expandido con opciones: "Cualquier modalidad", "Solo Online", "Solo Presencial"</p>
        </div>
        
        <div class="feature-card">
            <h4>✅ Horarios Específicos por Modalidad</h4>
            <p>Cada slot de horario puede tener modalidades diferentes (ej: 9:00 solo online, 10:00 ambas)</p>
        </div>
        
        <div class="feature-card">
            <h4>✅ Experiencia de Usuario Mejorada</h4>
            <p>Selección inteligente, validación completa y persistencia de datos</p>
        </div>
    </div>

    <h2>🏗️ Arquitectura de Cambios</h2>

    <h3>1. Sistema de Tipos (TypeScript)</h3>

    <div class="tech-spec">
        Se implementó un sistema robusto de tipos que garantiza la consistencia de datos a lo largo de toda la aplicación.
    </div>

    <div class="before-after">
        <div class="before">
            <h5>❌ Antes</h5>
            <div class="code-block">
export interface HorarioDisponible {
  fecha: string;
  horarios: string[];
}

export interface Psicologo {
  // ... otros campos
  disponibilidad: HorarioDisponible[];
}
            </div>
        </div>
        <div class="after">
            <h5>✅ Después</h5>
            <div class="code-block">
export type Modalidad = 'online' | 'presencial';

export interface HorarioModalidad {
  hora: string;
  modalidades: Modalidad[];
}

export interface HorarioDisponible {
  fecha: string;
  horarios: HorarioModalidad[];
}

export interface Psicologo {
  // ... otros campos
  modalidades: Modalidad[];
  disponibilidad: HorarioDisponible[];
}
            </div>
        </div>
    </div>

    <h3>2. Estructura de Datos</h3>

    <p>La reestructuración permite máxima flexibilidad en la gestión de horarios:</p>

    <div class="change-box">
        <h4>🔄 Transformación de Datos</h4>
        <p><strong>Antes:</strong> Horarios como array simple de strings</p>
        <p><strong>Después:</strong> Objetos complejos con hora y modalidades específicas</p>
        
        <div class="code-block">
// Ejemplo de estructura nueva
{ 
  fecha: '2025-07-18', 
  horarios: [
    { hora: '09:00', modalidades: ['online', 'presencial'] },
    { hora: '10:00', modalidades: ['online'] },
    { hora: '15:00', modalidades: ['presencial'] }
  ]
}
        </div>
    </div>

    <h2>🔍 Implementación del Sistema de Filtros</h2>

    <h3>Lógica de Filtrado Inteligente</h3>

    <div class="tech-spec">
        El sistema de filtrado considera tanto las modalidades generales del psicólogo como las modalidades específicas de cada horario.
    </div>

    <div class="change-box">
        <h4>📊 Algoritmo de Filtrado</h4>
        <div class="code-block">
const cumpleModalidad = modalidadSeleccionada === '' || 
  psicologo.modalidades.includes(modalidadSeleccionada);

const cumpleDisponibilidad = !filtros.disponibilidad || 
  psicologo.disponibilidad.some(disp => {
    if (disp.fecha !== filtros.disponibilidad) return false;
    
    if (modalidadSeleccionada === '') return disp.horarios.length > 0;
    
    return disp.horarios.some(horario => 
      horario.modalidades.includes(modalidadSeleccionada)
    );
  });
        </div>
        
        <p><strong>Ventajas del enfoque:</strong></p>
        <ul>
            <li>✅ Filtrado preciso por modalidad global</li>
            <li>✅ Filtrado granular por fecha + modalidad</li>
            <li>✅ Combinación inteligente de filtros múltiples</li>
            <li>✅ Rendimiento optimizado</li>
        </ul>
    </div>

    <h2>🎨 Mejoras en la Interfaz de Usuario</h2>

    <h3>1. Tarjetas de Psicólogos Mejoradas</h3>

    <div class="before-after">
        <div class="before">
            <h5>❌ Antes</h5>
            <ul>
                <li>Solo información básica</li>
                <li>Horarios sin contexto de modalidad</li>
                <li>No se distinguían las opciones disponibles</li>
            </ul>
        </div>
        <div class="after">
            <h5>✅ Después</h5>
            <ul>
                <li>Sección dedicada "Modalidades disponibles"</li>
                <li>Iconos distintivos (💻 Online, 🏢 Presencial)</li>
                <li>Preview de horarios con modalidades</li>
                <li>Información clara y accesible</li>
            </ul>
        </div>
    </div>

    <h3>2. Calendario Interactivo Avanzado</h3>

    <div class="change-box">
        <h4>📅 Funcionalidades del Calendario</h4>
        <ul>
            <li><span class="emoji">🎯</span> <strong>Slots granulares:</strong> Cada horario muestra sus modalidades específicas</li>
            <li><span class="emoji">🔍</span> <strong>Vista clara:</strong> Diseño optimizado hora + modalidades</li>
            <li><span class="emoji">📱</span> <strong>Responsive:</strong> Adaptación perfecta a diferentes pantallas</li>
            <li><span class="emoji">✨</span> <strong>Leyenda informativa:</strong> Explicación de iconos y estados</li>
        </ul>
    </div>

    <h3>3. Proceso de Agendamiento Inteligente</h3>

    <div class="feature-grid">
        <div class="feature-card">
            <h4>🧠 Selección Automática</h4>
            <p>Si un horario tiene solo una modalidad disponible, se selecciona automáticamente</p>
        </div>
        
        <div class="feature-card">
            <h4>🎛️ Selector Dinámico</h4>
            <p>Si hay múltiples modalidades, se presenta un selector desplegable</p>
        </div>
        
        <div class="feature-card">
            <h4>📋 Resumen Completo</h4>
            <p>Vista previa con todos los detalles incluyendo modalidad seleccionada</p>
        </div>
        
        <div class="feature-card">
            <h4>✅ Validación Robusta</h4>
            <p>Verificación de todos los campos requeridos antes de confirmar</p>
        </div>
    </div>

    <h2>💾 Gestión de Datos y Persistencia</h2>

    <h3>Almacenamiento de Sesiones</h3>

    <div class="tech-spec">
        Todas las sesiones agendadas incluyen información completa de modalidad y se persisten en localStorage del navegador.
    </div>

    <div class="change-box">
        <h4>📦 Estructura de Sesión Completa</h4>
        <div class="code-block">
interface Sesion {
  id: string;
  psicologoId: string;
  fecha: string;
  hora: string;
  modalidad: Modalidad;  // ← Campo nuevo
  paciente: {
    nombre: string;
    email: string;
    telefono: string;
  };
  especialidad: string;
  estado: 'confirmada' | 'pendiente' | 'cancelada';
}
        </div>
    </div>

    <h2>🔧 Detalles Técnicos de Implementación</h2>

    <h3>Componentes Modificados</h3>

    <div class="table-container">
        <table>
            <tr>
                <th>Componente</th>
                <th>Cambios Principales</th>
                <th>Impacto</th>
            </tr>
            <tr>
                <td><strong>types/index.ts</strong></td>
                <td>Nuevos tipos Modalidad, interfaces actualizadas</td>
                <td>🔴 Alto - Base tipada</td>
            </tr>
            <tr>
                <td><strong>data/psicologos.ts</strong></td>
                <td>Reestructuración completa de datos</td>
                <td>🔴 Alto - Datos fuente</td>
            </tr>
            <tr>
                <td><strong>FiltrosBusqueda.tsx</strong></td>
                <td>Nuevo filtro de modalidad</td>
                <td>🟡 Medio - Nueva funcionalidad</td>
            </tr>
            <tr>
                <td><strong>PsicologoCard.tsx</strong></td>
                <td>Sección modalidades, iconos, preview mejorado</td>
                <td>🟡 Medio - UX mejorada</td>
            </tr>
            <tr>
                <td><strong>CalendarioDisponibilidad.tsx</strong></td>
                <td>Modalidades por slot, layout actualizado</td>
                <td>🔴 Alto - Funcionalidad core</td>
            </tr>
            <tr>
                <td><strong>ModalAgendamiento.tsx</strong></td>
                <td>Selección inteligente, validación modalidad</td>
                <td>🔴 Alto - Proceso crítico</td>
            </tr>
            <tr>
                <td><strong>SesionesAgendadas.tsx</strong></td>
                <td>Muestra modalidad en sesiones guardadas</td>
                <td>🟢 Bajo - Display info</td>
            </tr>
            <tr>
                <td><strong>App.tsx</strong></td>
                <td>Lógica de filtrado actualizada</td>
                <td>🟡 Medio - Lógica central</td>
            </tr>
            <tr>
                <td><strong>App.css</strong></td>
                <td>Estilos para modalidades, layout mejorado</td>
                <td>🟢 Bajo - Presentación</td>
            </tr>
        </table>
    </div>

    <h3>Consideraciones de Rendimiento</h3>

    <div class="success-box">
        La implementación mantiene un rendimiento óptimo mediante el uso de useMemo para cálculos complejos y filtrado eficiente sin bucles anidados innecesarios.
    </div>

    <h2>🧪 Casos de Uso Cubiertos</h2>

    <h3>Escenarios de Filtrado</h3>

    <div class="feature-grid">
        <div class="feature-card">
            <h4>🔍 Filtro "Solo Online"</h4>
            <p>Muestra solo psicólogos que ofrecen consultas online, verificando tanto modalidades generales como horarios específicos</p>
        </div>
        
        <div class="feature-card">
            <h4>🏢 Filtro "Solo Presencial"</h4>
            <p>Filtra psicólogos con atención presencial, considerando disponibilidad real en modalidad presencial</p>
        </div>
        
        <div class="feature-card">
            <h4>📅 Filtro Combinado</h4>
            <p>Fecha específica + modalidad específica = resultados ultra precisos</p>
        </div>
        
        <div class="feature-card">
            <h4>🎯 Sin Filtro de Modalidad</h4>
            <p>Muestra todos los psicólogos independientemente de modalidad</p>
        </div>
    </div>

    <h3>Flujos de Agendamiento</h3>

    <div class="change-box">
        <h4>📋 Escenarios Manejados</h4>
        
        <p><strong>Escenario 1:</strong> Horario con una sola modalidad</p>
        <ul>
            <li>✅ Selección automática de modalidad</li>
            <li>✅ Campo mostrado como información (no editable)</li>
            <li>✅ Flujo simplificado para el usuario</li>
        </ul>
        
        <p><strong>Escenario 2:</strong> Horario con múltiples modalidades</p>
        <ul>
            <li>✅ Selector desplegable presentado</li>
            <li>✅ Validación que requiere selección</li>
            <li>✅ Opciones claras con iconos</li>
        </ul>
        
        <p><strong>Escenario 3:</strong> Validación y persistencia</p>
        <ul>
            <li>✅ Modalidad requerida antes de confirmar</li>
            <li>✅ Datos completos guardados en localStorage</li>
            <li>✅ Información mostrada en "Mis Sesiones"</li>
        </ul>
    </div>

    <h2>🎨 Sistema de Iconografía</h2>

    <h3>Convenciones Visuales</h3>

    <div class="table-container">
        <table>
            <tr>
                <th>Modalidad</th>
                <th>Icono</th>
                <th>Uso</th>
                <th>Contexto</th>
            </tr>
            <tr>
                <td>Online</td>
                <td>💻</td>
                <td>Consultas virtuales</td>
                <td>Tarjetas, calendario, resúmenes</td>
            </tr>
            <tr>
                <td>Presencial</td>
                <td>🏢</td>
                <td>Consultas en oficina</td>
                <td>Tarjetas, calendario, resúmenes</td>
            </tr>
            <tr>
                <td>Mixto</td>
                <td>💻 🏢</td>
                <td>Ambas modalidades</td>
                <td>Horarios con múltiples opciones</td>
            </tr>
        </table>
    </div>

    <h2>✅ Beneficios de la Implementación</h2>

    <h3>Para los Usuarios</h3>

    <ul>
        <li><span class="emoji">🎯</span> <strong>Claridad absoluta:</strong> Saben exactamente qué modalidades están disponibles</li>
        <li><span class="emoji">⚡</span> <strong>Filtrado eficiente:</strong> Encuentran rápidamente lo que buscan</li>
        <li><span class="emoji">🧠</span> <strong>Decisiones informadas:</strong> Pueden elegir entre online/presencial según preferencia</li>
        <li><span class="emoji">🔄</span> <strong>Flexibilidad:</strong> Algunos psicólogos ofrecen ambas modalidades</li>
    </ul>

    <h3>Para el Sistema</h3>

    <ul>
        <li><span class="emoji">🏗️</span> <strong>Arquitectura escalable:</strong> Fácil agregar nuevas modalidades en el futuro</li>
        <li><span class="emoji">🔒</span> <strong>Tipado fuerte:</strong> Previene errores en tiempo de compilación</li>
        <li><span class="emoji">📊</span> <strong>Datos estructurados:</strong> Análisis y reportes más precisos</li>
        <li><span class="emoji">🔧</span> <strong>Mantenibilidad:</strong> Código bien organizado y documentado</li>
    </ul>

    <h2>🚀 Posibles Mejoras Futuras</h2>

    <div class="feature-grid">
        <div class="feature-card">
            <h4>🌐 Modalidades Híbridas</h4>
            <p>Sesiones que combinan online + presencial en el mismo horario</p>
        </div>
        
        <div class="feature-card">
            <h4>📍 Geolocalización</h4>
            <p>Filtrar automáticamente por modalidad según ubicación del usuario</p>
        </div>
        
        <div class="feature-card">
            <h4>🎨 Personalización Visual</h4>
            <p>Permitir a psicólogos personalizar iconos o colores de sus modalidades</p>
        </div>
        
        <div class="feature-card">
            <h4>📈 Analytics Avanzados</h4>
            <p>Reportes de popularidad por modalidad, tendencias de uso</p>
        </div>
    </div>

    <h2>📝 Conclusiones</h2>

    <div class="success-box">
        La implementación del sistema de modalidades ha sido completada exitosamente, cumpliendo todos los requisitos solicitados y manteniendo la alta calidad del código existente.
    </div>

    <p>Los cambios realizados son:</p>

    <ul>
        <li>✅ <strong>Completamente funcionales</strong> - Todas las características solicitadas implementadas</li>
        <li>✅ <strong>Técnicamente sólidos</strong> - Arquitectura escalable y tipado fuerte</li>
        <li>✅ <strong>User-friendly</strong> - Interfaz intuitiva con feedback visual claro</li>
        <li>✅ <strong>Bien integrados</strong> - Sin romper funcionalidades existentes</li>
        <li>✅ <strong>Optimizados</strong> - Rendimiento mantenido, código eficiente</li>
    </ul>

    <p>La plataforma PsiConnect ahora ofrece una experiencia completa y moderna para la gestión de modalidades de consulta, posicionándola como una solución robusta para la telemedicina y atención psicológica.</p>

    <div class="footer">
        <p><strong>PsiConnect - Sistema de Modalidades v2.0</strong></p>
        <p>Documentación Técnica - ${new Date().toLocaleDateString('es-ES')}</p>
        <p>Implementación completa: Tipos, Lógica, UI/UX, Persistencia</p>
    </div>
</body>
</html>
`;

async function generateModalidadesDoc() {
    try {
        console.log('🚀 Iniciando generación de documentación técnica...');
        
        // Lanzar navegador
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Configurar contenido HTML
        await page.setContent(documentContent, {
            waitUntil: 'networkidle0'
        });
        
        // Configurar opciones del PDF
        const pdfOptions = {
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            }
        };
        
        // Generar PDF
        const outputPath = path.join(__dirname, '..', 'Documentacion-Modalidades-PsiConnect.pdf');
        await page.pdf({
            ...pdfOptions,
            path: outputPath
        });
        
        await browser.close();
        
        console.log('✅ Documentación técnica generada exitosamente!');
        console.log('📄 Ubicación:', outputPath);
        console.log('🎉 El archivo está listo para revisión.');
        console.log('');
        console.log('📋 Contenido del documento:');
        console.log('   • Resumen ejecutivo de cambios');
        console.log('   • Arquitectura técnica detallada');
        console.log('   • Comparaciones antes/después');
        console.log('   • Especificaciones de implementación');
        console.log('   • Casos de uso cubiertos');
        console.log('   • Beneficios y mejoras logradas');
        
    } catch (error) {
        console.error('❌ Error al generar la documentación:', error);
        process.exit(1);
    }
}

// Ejecutar la función
if (require.main === module) {
    generateModalidadesDoc();
}

module.exports = generateModalidadesDoc; 