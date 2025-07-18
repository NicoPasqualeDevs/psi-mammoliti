const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const manualContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manual de Usuario - PsiConnect</title>
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
            max-width: 800px;
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
        
        .step-box {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
            border-left: 4px solid #f188a6;
        }
        
        .step-number {
            background: #8475b3;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 10px;
        }
        
        .tip-box {
            background: #e8f5e8;
            border: 1px solid #4caf50;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        
        .tip-box::before {
            content: "💡 Consejo: ";
            font-weight: bold;
            color: #2e7d32;
        }
        
        .warning-box {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        
        .warning-box::before {
            content: "⚠️ Importante: ";
            font-weight: bold;
            color: #856404;
        }
        
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
        
        .screenshot-placeholder {
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 8px;
            padding: 40px;
            text-align: center;
            margin: 20px 0;
            color: #666;
            font-style: italic;
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
            .step-box, .tip-box, .warning-box { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧠 PsiConnect</h1>
        <p class="subtitle">Manual de Usuario - Guía Completa</p>
    </div>

    <div class="version-info">
        <strong>Versión:</strong> 1.0<br>
        <strong>Fecha:</strong> 18/7/2025<br>
        <strong>Dirigido a:</strong> Usuarios finales (Pacientes)
    </div>

    <h2>📖 Introducción</h2>
    
    <p>¡Bienvenido a PsiConnect! Esta plataforma te permite encontrar y agendar sesiones con psicólogos especializados de manera fácil y rápida. Este manual te guiará paso a paso para aprovechar al máximo todas las funcionalidades.</p>

    <div class="tip-box">
        PsiConnect adapta automáticamente los horarios a tu zona horaria, así que siempre verás las horas correctas para tu ubicación.
    </div>

    <h2>🚀 Primeros Pasos</h2>

    <h3>Acceso a la Plataforma</h3>
    
    <div class="step-box">
        <span class="step-number">1</span>
        <strong>Abrir la aplicación:</strong> Ingresa a la URL de PsiConnect en tu navegador web (Chrome, Firefox, Safari o Edge).
    </div>

    <div class="step-box">
        <span class="step-number">2</span>
        <strong>Pantalla principal:</strong> Verás el encabezado con el logo y dos opciones principales:
        <ul>
            <li>🔍 <strong>Buscar Especialistas</strong> - Para encontrar psicólogos</li>
            <li>📅 <strong>Mis Sesiones</strong> - Para ver tus citas agendadas</li>
        </ul>
    </div>

    <h2>🔍 Buscar Psicólogos</h2>

    <h3>Panel de Filtros</h3>
    
    <p>En la parte izquierda encontrarás los filtros para personalizar tu búsqueda:</p>

    <div class="feature-grid">
        <div class="feature-card">
            <h4>🎯 Por Especialidad</h4>
            <p>Selecciona el área que necesitas:</p>
            <ul>
                <li>Ansiedad</li>
                <li>Depresión</li>
                <li>Terapia Familiar</li>
                <li>Psicología Infantil</li>
                <li>Estrés Laboral</li>
                <li>Trauma</li>
                <li>Y más...</li>
            </ul>
        </div>
        
        <div class="feature-card">
            <h4>💰 Por Precio</h4>
            <p>Ajusta el precio máximo que estás dispuesto a pagar por sesión usando el deslizador (de $50 a $150).</p>
        </div>
        
        <div class="feature-card">
            <h4>📅 Por Disponibilidad</h4>
            <p>Filtra por fecha específica si tienes preferencia por un día en particular.</p>
        </div>
    </div>

    <div class="tip-box">
        Los filtros se aplican automáticamente. No necesitas hacer clic en ningún botón de "buscar".
    </div>

    <h3>Interpretando los Perfiles</h3>

    <p>Cada psicólogo aparece en una tarjeta que contiene:</p>

    <div class="step-box">
        <h4>📋 Información Personal</h4>
        <ul>
            <li><strong>Foto y nombre completo</strong></li>
            <li><strong>Rating:</strong> Estrellas y puntuación numérica</li>
            <li><strong>Experiencia:</strong> Años de práctica profesional</li>
            <li><strong>Descripción:</strong> Breve resumen de su enfoque</li>
        </ul>
    </div>

    <div class="step-box">
        <h4>🏷️ Especialidades</h4>
        <p>Tags de colores que muestran las áreas en las que se especializa el profesional.</p>
    </div>

    <div class="step-box">
        <h4>⏰ Disponibilidad</h4>
        <ul>
            <li><strong>Total de horarios:</strong> Cuántos slots tiene disponibles</li>
            <li><strong>Próxima fecha:</strong> El día más cercano con disponibilidad</li>
            <li><strong>Preview de horarios:</strong> Los primeros 3 horarios disponibles</li>
            <li><strong>Zona horaria:</strong> Horarios adaptados a tu ubicación</li>
        </ul>
    </div>

    <div class="warning-box">
        Los horarios se muestran tanto en la hora del psicólogo como en tu hora local para evitar confusiones.
    </div>

    <h2>📅 Agendar una Sesión</h2>

    <h3>Proceso de Agendamiento</h3>

    <div class="step-box">
        <span class="step-number">1</span>
        <strong>Seleccionar psicólogo:</strong> Haz clic en "Ver Horarios" en la tarjeta del profesional que te interese.
    </div>

    <div class="step-box">
        <span class="step-number">2</span>
        <strong>Vista del calendario:</strong> Se abrirá una ventana con dos pestañas:
        <ul>
            <li>📅 <strong>Vista Calendario</strong> - Para seleccionar fecha y hora</li>
            <li>📝 <strong>Datos de la Sesión</strong> - Para completar tu información</li>
        </ul>
    </div>

    <h3>Usando el Calendario Semanal</h3>

    <div class="step-box">
        <span class="step-number">3</span>
        <strong>Navegar por semanas:</strong>
        <ul>
            <li>Usa los botones "← Semana anterior" y "Semana siguiente →"</li>
            <li>El día actual aparece resaltado en naranja</li>
            <li>Los días pasados aparecen en gris y no se pueden seleccionar</li>
        </ul>
    </div>

    <div class="step-box">
        <span class="step-number">4</span>
        <strong>Seleccionar horario:</strong>
        <ul>
            <li>Cada día muestra los horarios disponibles</li>
            <li>Haz clic en el horario que prefieras</li>
            <li>Verás tanto la hora del psicólogo como tu hora local</li>
        </ul>
    </div>

    <div class="tip-box">
        La información de zona horaria te ayuda a evitar confusiones. Siempre verás "Hora (psicólogo): 14:00" y "Hora (tu zona): 15:00" por ejemplo.
    </div>

    <h3>Completar Datos de la Sesión</h3>

    <div class="step-box">
        <span class="step-number">5</span>
        <strong>Cambiar a la pestaña "Datos de la Sesión":</strong> Una vez seleccionado el horario, verás un resumen y podrás completar:
        <ul>
            <li><strong>Especialidad:</strong> Elige el área específica de consulta</li>
            <li><strong>Nombre completo</strong> (obligatorio)</li>
            <li><strong>Email</strong> (obligatorio)</li>
            <li><strong>Teléfono</strong> (opcional)</li>
        </ul>
    </div>

    <div class="step-box">
        <span class="step-number">6</span>
        <strong>Revisar el resumen:</strong> Antes de confirmar, verifica:
        <ul>
            <li>Datos del psicólogo</li>
            <li>Fecha y hora (en ambas zonas horarias)</li>
            <li>Especialidad seleccionada</li>
            <li>Precio de la sesión</li>
        </ul>
    </div>

    <div class="step-box">
        <span class="step-number">7</span>
        <strong>Confirmar agendamiento:</strong> Haz clic en "Confirmar Agendamiento" para finalizar.
    </div>

    <div class="warning-box">
        Asegúrate de que tu email sea correcto, ya que es el medio principal de contacto para la sesión.
    </div>

    <h2>📋 Gestionar tus Sesiones</h2>

    <h3>Ver Sesiones Agendadas</h3>

    <div class="step-box">
        <span class="step-number">1</span>
        <strong>Acceder a "Mis Sesiones":</strong> Haz clic en el botón "📅 Mis Sesiones" en la parte superior.
    </div>

    <div class="step-box">
        <span class="step-number">2</span>
        <strong>Información mostrada:</strong> Para cada sesión verás:
        <ul>
            <li><strong>Psicólogo:</strong> Nombre del profesional</li>
            <li><strong>Estado:</strong> Confirmada, pendiente o cancelada</li>
            <li><strong>Fecha y hora</strong></li>
            <li><strong>Especialidad</strong> de la consulta</li>
            <li><strong>Precio</strong> de la sesión</li>
            <li><strong>Tus datos de contacto</strong></li>
        </ul>
    </div>

    <h3>Estados de las Sesiones</h3>

    <div class="table-container">
        <table>
            <tr>
                <th>Estado</th>
                <th>Significado</th>
                <th>Acción Requerida</th>
            </tr>
            <tr>
                <td><strong>Confirmada</strong></td>
                <td>La sesión está confirmada y lista</td>
                <td>Presentarse en la fecha y hora acordada</td>
            </tr>
            <tr>
                <td><strong>Pendiente</strong></td>
                <td>Esperando confirmación del psicólogo</td>
                <td>Esperar notificación de confirmación</td>
            </tr>
            <tr>
                <td><strong>Cancelada</strong></td>
                <td>La sesión fue cancelada</td>
                <td>Contactar al psicólogo si es necesario</td>
            </tr>
        </table>
    </div>

    <h2>🌍 Funcionalidades Especiales</h2>

    <h3>Adaptación de Zona Horaria</h3>

    <p>PsiConnect detecta automáticamente tu ubicación y ajusta todos los horarios:</p>

    <ul>
        <li><span class="emoji">🌐</span> <strong>Detección automática:</strong> No necesitas configurar nada</li>
        <li><span class="emoji">🕒</span> <strong>Doble horario:</strong> Siempre ves la hora del psicólogo y tu hora local</li>
        <li><span class="emoji">📍</span> <strong>Ubicación clara:</strong> Se indica explícitamente cada zona horaria</li>
        <li><span class="emoji">✅</span> <strong>Sin errores:</strong> Evita confusiones en el agendamiento</li>
    </ul>

    <h3>Filtrado Inteligente</h3>

    <ul>
        <li><span class="emoji">⚡</span> <strong>Tiempo real:</strong> Los resultados se actualizan mientras escribes</li>
        <li><span class="emoji">🔄</span> <strong>Combinable:</strong> Puedes usar múltiples filtros simultáneamente</li>
        <li><span class="emoji">🎯</span> <strong>Preciso:</strong> Encuentra exactamente lo que necesitas</li>
    </ul>

    <h2>📱 Compatibilidad y Dispositivos</h2>

    <h3>Dispositivos Soportados</h3>

    <div class="feature-grid">
        <div class="feature-card">
            <h4>💻 Computadora</h4>
            <p>Experiencia completa con vista de dos columnas y todas las funcionalidades.</p>
        </div>
        
        <div class="feature-card">
            <h4>📱 Móvil</h4>
            <p>Interfaz adaptada con navegación táctil optimizada y vista apilada.</p>
        </div>
        
        <div class="feature-card">
            <h4>📲 Tablet</h4>
            <p>Layout intermedio que aprovecha el espacio disponible.</p>
        </div>
    </div>

    <h3>Navegadores Recomendados</h3>

    <ul>
        <li>Google Chrome (90+)</li>
        <li>Mozilla Firefox (88+)</li>
        <li>Safari (14+)</li>
        <li>Microsoft Edge (90+)</li>
    </ul>

    <h2>❓ Preguntas Frecuentes</h2>

    <h4>¿Cómo sé que mi sesión está confirmada?</h4>
    <p>Tu sesión aparecerá con estado "Confirmada" en la sección "Mis Sesiones" y recibirás una notificación en pantalla.</p>

    <h4>¿Puedo cancelar una sesión?</h4>
    <p>Actualmente la plataforma no incluye cancelación automática. Debes contactar directamente al psicólogo.</p>

    <h4>¿Por qué veo dos horarios diferentes?</h4>
    <p>Para evitar confusiones, mostramos tanto el horario local del psicólogo como tu horario local. Asegúrate de considerar tu hora local para la sesión.</p>

    <h4>¿Qué pasa si no hay psicólogos disponibles?</h4>
    <p>Intenta ajustar los filtros (aumentar el precio máximo, cambiar la especialidad o quitar el filtro de fecha).</p>

    <h4>¿Es seguro proporcionar mis datos personales?</h4>
    <p>Sí, tus datos solo se usan para la coordinación de la sesión y no se comparten con terceros.</p>

    <h2>🆘 Soporte y Ayuda</h2>

    <h3>Si Encuentras Problemas</h3>

    <ol>
        <li><strong>Refresca la página:</strong> Muchos problemas se resuelven recargando</li>
        <li><strong>Verifica tu conexión a internet</strong></li>
        <li><strong>Intenta con otro navegador</strong></li>
        <li><strong>Limpia el caché del navegador</strong></li>
    </ol>

    <div class="tip-box">
        Si el problema persiste, anota qué estabas intentando hacer y en qué momento ocurrió el error para reportarlo al equipo de soporte.
    </div>

    <h3>Consejos para una Mejor Experiencia</h3>

    <ul>
        <li><span class="emoji">🔍</span> <strong>Usa filtros específicos</strong> para encontrar rápidamente lo que buscas</li>
        <li><span class="emoji">⏰</span> <strong>Verifica siempre la zona horaria</strong> antes de confirmar</li>
        <li><span class="emoji">📧</span> <strong>Proporciona un email válido</strong> para recibir confirmaciones</li>
        <li><span class="emoji">📱</span> <strong>La app funciona igual de bien en móvil</strong> que en computadora</li>
    </ul>

    <div class="footer">
        <p><strong>PsiConnect</strong> - Conectando pacientes con profesionales de la salud mental</p>
        <p>Manual de Usuario v1.0 - 18/7/2025</p>
        <p>Para soporte técnico, contacta al equipo de desarrollo</p>
    </div>
</body>
</html>
`;

async function generatePDF() {
    try {
        console.log('🚀 Iniciando generación del manual...');
        
        // Lanzar navegador
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Configurar contenido HTML
        await page.setContent(manualContent, {
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
        const outputPath = path.join(__dirname, '..', 'Manual-Usuario-PsiConnect.pdf');
        await page.pdf({
            ...pdfOptions,
            path: outputPath
        });
        
        await browser.close();
        
        console.log('✅ Manual generado exitosamente!');
        console.log('📄 Ubicación:', outputPath);
        console.log('🎉 El archivo está listo para usar.');
        
    } catch (error) {
        console.error('❌ Error al generar el manual:', error);
        process.exit(1);
    }
}

// Ejecutar la función
if (require.main === module) {
    generatePDF();
}

module.exports = generatePDF; 