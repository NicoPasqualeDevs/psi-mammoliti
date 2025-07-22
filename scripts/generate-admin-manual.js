const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const adminManualContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manual del Panel de Administración - PsiConnect</title>
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
        
        .admin-tip {
            background: #e3f2fd;
            border: 1px solid #2196f3;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        
        .admin-tip::before {
            content: "👔 Consejo de Administrador: ";
            font-weight: bold;
            color: #1976d2;
        }
        
        .warning-box {
            background: #ffebee;
            border: 1px solid #f44336;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        
        .warning-box::before {
            content: "🚨 Importante: ";
            font-weight: bold;
            color: #c62828;
        }
        
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
            font-size: 1.1rem;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin: 20px 0;
        }
        
        .stat-demo {
            background: linear-gradient(135deg, #8475b3, #665090);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        
        .stat-demo h4 {
            color: white;
            margin-bottom: 8px;
            font-size: 0.9rem;
        }
        
        .stat-demo .number {
            font-size: 2rem;
            font-weight: bold;
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
        
        .form-demo {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .form-field {
            margin-bottom: 15px;
        }
        
        .form-field label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
            color: #4a3d73;
        }
        
        .form-field input, .form-field textarea {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
        }
        
        .form-field small {
            color: #666;
            font-size: 0.85rem;
        }
        
        .checkbox-group {
            display: flex;
            gap: 20px;
            margin-top: 8px;
        }
        
        .checkbox-item {
            display: flex;
            align-items: center;
            gap: 8px;
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
        
        .action-buttons {
            display: flex;
            gap: 10px;
            margin: 20px 0;
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-primary {
            background: #8475b3;
            color: white;
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-danger {
            background: #dc3545;
            color: white;
        }
        
        .btn-edit {
            background: #28a745;
            color: white;
            padding: 6px 12px;
            font-size: 0.8rem;
        }
        
        .psicologo-demo {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .psicologo-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .avatar-demo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8475b3, #f188a6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }
        
        .access-section {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .url-highlight {
            background: #e9ecef;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            color: #495057;
            margin: 10px 0;
            display: inline-block;
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
            .step-box, .admin-tip, .warning-box { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛠️ Panel de Administración</h1>
        <p class="subtitle">Manual del Administrador - PsiConnect</p>
    </div>

    <div class="version-info">
        <strong>Versión:</strong> 2.0<br>
        <strong>Fecha:</strong> 19/1/2025<br>
        <strong>Dirigido a:</strong> Administradores del Sistema<br>
        <strong>Nivel:</strong> Técnico
    </div>

    <h2>📖 Introducción</h2>
    
    <p>El Panel de Administración de PsiConnect es una herramienta completa para gestionar la base de datos de psicólogos, monitorear estadísticas del sistema y mantener la plataforma actualizada. Este manual está dirigido a administradores con acceso privilegiado al sistema.</p>

    <div class="admin-tip">
        El panel utiliza una base de datos local IndexedDB que persiste en el navegador. Todos los cambios son inmediatos y permanentes.
    </div>

    <h2>🚪 Acceso al Panel</h2>

    <div class="access-section">
        <h3>URL de Acceso</h3>
        <p>Para acceder al panel de administración, navega a:</p>
        <div class="url-highlight">
            http://localhost:3000/admin
        </div>
        <p><em>En producción, reemplaza localhost:3000 con tu dominio</em></p>
    </div>

    <div class="step-box">
        <span class="step-number">1</span>
        <strong>Desde la aplicación principal:</strong> En cualquier página de PsiConnect, agrega <code>/admin</code> al final de la URL.
    </div>

    <div class="step-box">
        <span class="step-number">2</span>
        <strong>Acceso directo:</strong> Guarda la URL del panel en favoritos para acceso rápido.
    </div>

    <div class="warning-box">
        El panel no tiene autenticación implementada. En un entorno de producción, implementa controles de acceso apropiados.
    </div>

    <h2>📊 Dashboard Principal</h2>

    <h3>Estadísticas del Sistema</h3>
    
    <p>Al acceder al panel, verás inmediatamente las métricas clave del sistema:</p>

    <div class="stats-grid">
        <div class="stat-demo">
            <h4>👥 Psicólogos</h4>
            <div class="number">15</div>
        </div>
        <div class="stat-demo">
            <h4>📅 Sesiones</h4>
            <div class="number">42</div>
        </div>
        <div class="stat-demo">
            <h4>🏷️ Especialidades</h4>
            <div class="number">8</div>
        </div>
    </div>

    <div class="feature-grid">
        <div class="feature-card">
            <h4>👥 Total de Psicólogos</h4>
            <p>Muestra el número total de profesionales registrados en la plataforma. Se actualiza automáticamente al agregar o eliminar psicólogos.</p>
        </div>
        
        <div class="feature-card">
            <h4>📅 Sesiones Agendadas</h4>
            <p>Cuenta todas las sesiones programadas por los usuarios, independientemente de su estado (confirmada, pendiente, cancelada).</p>
        </div>
        
        <div class="feature-card">
            <h4>🏷️ Especialidades Únicas</h4>
            <p>Número de especialidades diferentes disponibles en el sistema, calculado dinámicamente desde todos los psicólogos.</p>
        </div>
    </div>

    <h3>Navegación del Panel</h3>

    <div class="step-box">
        <strong>Botón "Volver a la aplicación":</strong> Ubicado en la esquina superior, te permite regresar a la vista pública sin perder el contexto del panel.
    </div>

    <h2>👥 Gestión de Psicólogos</h2>

    <h3>Agregar Nuevo Psicólogo</h3>

    <div class="step-box">
        <span class="step-number">1</span>
        <strong>Iniciar creación:</strong> Haz clic en el botón "✏️ Agregar Nuevo Psicólogo" en la sección de acciones.
    </div>

    <div class="step-box">
        <span class="step-number">2</span>
        <strong>Completar formulario:</strong> Se desplegará un formulario completo con todos los campos necesarios.
    </div>

    <h4>Campos del Formulario</h4>

    <div class="form-demo">
        <div class="form-field">
            <label>Nombre: *</label>
            <input type="text" placeholder="Nombre del psicólogo" readonly>
            <small>Campo obligatorio. Solo el nombre de pila.</small>
        </div>
        
        <div class="form-field">
            <label>Apellido: *</label>
            <input type="text" placeholder="Apellido del psicólogo" readonly>
            <small>Campo obligatorio. Apellido(s) del profesional.</small>
        </div>
        
        <div class="form-field">
            <label>Especialidades (separadas por comas): *</label>
            <input type="text" placeholder="Ej: Ansiedad, Depresión, Terapia Cognitivo-Conductual" readonly>
            <small>Lista de especialidades separadas por comas. Se convertirán en tags individuales.</small>
        </div>
        
        <div class="form-field">
            <label>Experiencia (años): *</label>
            <input type="number" value="5" readonly>
            <small>Rango: 1-30 años. Debe ser un número entero.</small>
        </div>
        
        <div class="form-field">
            <label>Precio por sesión ($): *</label>
            <input type="number" value="75" readonly>
            <small>Rango: $30-$300. Se incrementa de 5 en 5.</small>
        </div>
        
        <div class="form-field">
            <label>Modalidades disponibles: *</label>
            <div class="checkbox-group">
                <div class="checkbox-item">
                    <input type="checkbox" checked readonly>
                    <span>💻 Online</span>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" checked readonly>
                    <span>🏢 Presencial</span>
                </div>
            </div>
            <small>Debe seleccionar al menos una modalidad.</small>
        </div>
        
        <div class="form-field">
            <label>Descripción: *</label>
            <textarea placeholder="Descripción profesional del psicólogo, especialidades, enfoque terapéutico..." rows="3" readonly></textarea>
            <small>Descripción detallada que aparecerá en el perfil público.</small>
        </div>
        
        <div class="checkbox-item" style="margin-top: 15px;">
            <input type="checkbox" checked readonly>
            <span>Generar horarios de disponibilidad automáticamente</span>
        </div>
        <small>Si se marca, el sistema creará horarios aleatorios para las próximas semanas.</small>
    </div>

    <div class="admin-tip">
        El sistema genera automáticamente un ID único, rating aleatorio (3.5-5.0) e imagen de placeholder para cada nuevo psicólogo.
    </div>

    <h3>Validaciones del Formulario</h3>

    <div class="table-container">
        <table>
            <tr>
                <th>Campo</th>
                <th>Validación</th>
                <th>Mensaje de Error</th>
            </tr>
            <tr>
                <td>Nombre</td>
                <td>No puede estar vacío</td>
                <td>"El nombre es requerido"</td>
            </tr>
            <tr>
                <td>Apellido</td>
                <td>No puede estar vacío</td>
                <td>"El apellido es requerido"</td>
            </tr>
            <tr>
                <td>Especialidades</td>
                <td>Debe tener al menos una</td>
                <td>"Debes agregar al menos una especialidad"</td>
            </tr>
            <tr>
                <td>Experiencia</td>
                <td>Entre 1 y 30 años</td>
                <td>"La experiencia debe estar entre 1 y 30 años"</td>
            </tr>
            <tr>
                <td>Precio</td>
                <td>Entre $30 y $300</td>
                <td>"El precio debe estar entre $30 y $300"</td>
            </tr>
            <tr>
                <td>Modalidades</td>
                <td>Al menos una seleccionada</td>
                <td>"Debes seleccionar al menos una modalidad"</td>
            </tr>
            <tr>
                <td>Descripción</td>
                <td>No puede estar vacía</td>
                <td>"La descripción es requerida"</td>
            </tr>
        </table>
    </div>

    <h3>Editar Psicólogo Existente</h3>

    <div class="step-box">
        <span class="step-number">1</span>
        <strong>Localizar en la lista:</strong> Busca el psicólogo en la sección "📋 Psicólogos Registrados".
    </div>

    <div class="step-box">
        <span class="step-number">2</span>
        <strong>Iniciar edición:</strong> Haz clic en el botón "✏️ Editar" correspondiente.
    </div>

    <div class="step-box">
        <span class="step-number">3</span>
        <strong>Modificar datos:</strong> El formulario se pre-poblará con los datos actuales. Modifica los campos necesarios.
    </div>

    <div class="step-box">
        <span class="step-number">4</span>
        <strong>Guardar cambios:</strong> Haz clic en "Actualizar Psicólogo" para confirmar los cambios.
    </div>

    <div class="admin-tip">
        Al editar un psicólogo existente, la opción de "generar horarios automáticamente" no aparece, ya que esto solo aplica para nuevos profesionales.
    </div>

    <h3>Eliminar Psicólogo</h3>

    <div class="warning-box">
        La eliminación es permanente e irreversible. Asegúrate de tener una copia de seguridad si es necesario.
    </div>

    <div class="step-box">
        <span class="step-number">1</span>
        <strong>Localizar en la lista:</strong> Encuentra el psicólogo que deseas eliminar.
    </div>

    <div class="step-box">
        <span class="step-number">2</span>
        <strong>Hacer clic en eliminar:</strong> Presiona el botón "🗑️ Eliminar" correspondiente.
    </div>

    <div class="step-box">
        <span class="step-number">3</span>
        <strong>Confirmar acción:</strong> Aparecerá un diálogo de confirmación con el nombre del psicólogo.
    </div>

    <div class="step-box">
        <span class="step-number">4</span>
        <strong>Confirmación final:</strong> Haz clic en "Aceptar" para eliminar definitivamente.
    </div>

    <h2>📋 Lista de Psicólogos</h2>

    <h3>Información Mostrada</h3>

    <p>Cada psicólogo en la lista muestra:</p>

    <div class="psicologo-demo">
        <div class="psicologo-info">
            <div class="avatar-demo">👨‍⚕️</div>
            <div>
                <h4>Dr. Juan Pérez</h4>
                <p style="color: #666; margin: 4px 0;">Ansiedad, Depresión, Terapia Cognitiva</p>
                <p style="color: #888; font-size: 0.9rem; margin: 0;">8 años • $85 • ⭐ 4.7</p>
            </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">24 horarios</span>
            <button class="btn btn-edit">✏️ Editar</button>
            <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.8rem;">🗑️ Eliminar</button>
        </div>
    </div>

    <div class="feature-grid">
        <div class="feature-card">
            <h4>👤 Avatar y Nombre</h4>
            <p>Imagen de perfil (placeholder automático) y nombre completo del profesional.</p>
        </div>
        
        <div class="feature-card">
            <h4>🏷️ Especialidades</h4>
            <p>Lista de todas las especialidades del psicólogo, separadas por comas.</p>
        </div>
        
        <div class="feature-card">
            <h4>📊 Métricas</h4>
            <p>Años de experiencia, precio por sesión y rating promedio del profesional.</p>
        </div>
        
        <div class="feature-card">
            <h4>⏰ Contador de Horarios</h4>
            <p>Número total de slots de tiempo disponibles para agendar sesiones.</p>
        </div>
    </div>

    <h3>Estados de la Lista</h3>

    <div class="step-box">
        <strong>Lista vacía:</strong> Si no hay psicólogos registrados, se muestra un mensaje indicando que se agreguen nuevos profesionales.
    </div>

    <div class="step-box">
        <strong>Contador dinámico:</strong> El título muestra el número total de psicólogos registrados, que se actualiza en tiempo real.
    </div>

    <h2>🗄️ Gestión de Base de Datos</h2>

    <h3>Limpiar y Recargar Base de Datos</h3>

    <div class="warning-box">
        Esta operación elimina TODOS los datos de la base de datos local (psicólogos y sesiones) y restaura los datos originales del sistema.
    </div>

    <div class="step-box">
        <span class="step-number">1</span>
        <strong>Acceder a la función:</strong> Haz clic en el botón "🗑️ Limpiar y Recargar DB" en la sección de acciones.
    </div>

    <div class="step-box">
        <span class="step-number">2</span>
        <strong>Confirmación de seguridad:</strong> Aparecerá un diálogo advirtiendo sobre la pérdida de datos.
    </div>

    <div class="step-box">
        <span class="step-number">3</span>
        <strong>Proceso automático:</strong> El sistema eliminará todos los datos y reimportará la información inicial.
    </div>

    <div class="step-box">
        <span class="step-number">4</span>
        <strong>Recarga de página:</strong> La página se recargará automáticamente para mostrar los datos restaurados.
    </div>

    <h4>Casos de Uso para Limpiar BD</h4>

    <ul>
        <li><span class="emoji">🔧</span> <strong>Datos corruptos:</strong> Cuando hay problemas de integridad en la base de datos</li>
        <li><span class="emoji">🧪</span> <strong>Ambiente de pruebas:</strong> Para resetear el sistema a su estado inicial</li>
        <li><span class="emoji">📦</span> <strong>Demostración:</strong> Para mostrar el sistema con datos frescos</li>
        <li><span class="emoji">🗃️</span> <strong>Migración fallida:</strong> Si ocurre un error durante la importación inicial</li>
    </ul>

    <div class="admin-tip">
        La operación de limpieza y recarga es útil para solucionar problemas técnicos, pero considera hacer un backup manual si tienes datos importantes.
    </div>

    <h2>💻 Aspectos Técnicos</h2>

    <h3>Base de Datos IndexedDB</h3>

    <div class="feature-grid">
        <div class="feature-card">
            <h4>🗄️ Almacenamiento Local</h4>
            <p>Los datos se almacenan directamente en el navegador usando IndexedDB, proporcionando persistencia sin servidor.</p>
        </div>
        
        <div class="feature-card">
            <h4>⚡ Operaciones CRUD</h4>
            <p>Create (Crear), Read (Leer), Update (Actualizar), Delete (Eliminar) - todas las operaciones básicas están implementadas.</p>
        </div>
        
        <div class="feature-card">
            <h4>🔄 Transacciones</h4>
            <p>Las operaciones de base de datos usan transacciones para garantizar consistencia y integridad de datos.</p>
        </div>
        
        <div class="feature-card">
            <h4>📊 Cálculos Dinámicos</h4>
            <p>Las estadísticas se calculan en tiempo real desde los datos actuales, sin cachés estáticos.</p>
        </div>
    </div>

    <h3>Generación Automática de Horarios</h3>

    <p>Cuando se activa la opción "Generar horarios automáticamente":</p>

    <ul>
        <li><span class="emoji">📅</span> <strong>Período:</strong> Se generan horarios para las próximas 2-3 semanas</li>
        <li><span class="emoji">🎲</span> <strong>Aleatoriedad:</strong> Los horarios se distribuyen aleatoriamente para simular disponibilidad real</li>
        <li><span class="emoji">⏰</span> <strong>Horarios típicos:</strong> Entre 9:00 AM y 6:00 PM en intervalos de 1 hora</li>
        <li><span class="emoji">📍</span> <strong>Modalidades:</strong> Se asignan las modalidades seleccionadas a cada horario</li>
        <li><span class="emoji">🗓️</span> <strong>Días laborales:</strong> Principalmente lunes a viernes, con algunos fines de semana</li>
    </ul>

    <h3>Identificadores Únicos</h3>

    <div class="step-box">
        <strong>Formato del ID:</strong> Los psicólogos reciben IDs únicos en formato: <code>psi_[timestamp]_[random]</code>
        <br><br>
        <strong>Ejemplo:</strong> <code>psi_1642681234567_x7k9m2n8q</code>
    </div>

    <h2>🚨 Resolución de Problemas</h2>

    <h3>Problemas Comunes</h3>

    <div class="table-container">
        <table>
            <tr>
                <th>Problema</th>
                <th>Síntoma</th>
                <th>Solución</th>
            </tr>
            <tr>
                <td>No se cargan los datos</td>
                <td>Lista vacía o spinner infinito</td>
                <td>Usar "Limpiar y Recargar DB"</td>
            </tr>
            <tr>
                <td>Error al guardar</td>
                <td>Mensaje de error en formulario</td>
                <td>Verificar validaciones y refrescar página</td>
            </tr>
            <tr>
                <td>Estadísticas incorrectas</td>
                <td>Números no coinciden</td>
                <td>Refrescar la página para recalcular</td>
            </tr>
            <tr>
                <td>Formulario no responde</td>
                <td>Botones deshabilitados</td>
                <td>Esperar a que termine el procesamiento</td>
            </tr>
        </table>
    </div>

    <h3>Mensajes del Sistema</h3>

    <div class="feature-grid">
        <div class="feature-card">
            <h4>✅ Mensajes de Éxito</h4>
            <p>Aparecen en verde cuando las operaciones se completan correctamente. Se ocultan automáticamente después de 5 segundos.</p>
        </div>
        
        <div class="feature-card">
            <h4>❌ Mensajes de Error</h4>
            <p>Aparecen en rojo cuando algo sale mal. Incluyen detalles específicos del error para facilitar la resolución.</p>
        </div>
    </div>

    <h3>Logs y Depuración</h3>

    <div class="admin-tip">
        Abre las Herramientas de Desarrollador (F12) y ve a la pestaña "Console" para ver logs detallados de las operaciones de base de datos.
    </div>

    <h2>🔒 Consideraciones de Seguridad</h2>

    <div class="warning-box">
        El panel actual no tiene autenticación. En un entorno de producción, implementa autenticación y autorización apropiadas.
    </div>

    <h3>Recomendaciones de Seguridad</h3>

    <ul>
        <li><span class="emoji">🔐</span> <strong>Autenticación:</strong> Implementar login obligatorio para acceder al panel</li>
        <li><span class="emoji">👥</span> <strong>Roles de usuario:</strong> Crear diferentes niveles de acceso (admin, editor, viewer)</li>
        <li><span class="emoji">📝</span> <strong>Audit logs:</strong> Registrar todas las operaciones administrativas</li>
        <li><span class="emoji">🛡️</span> <strong>Validación server-side:</strong> No confiar solo en validaciones del cliente</li>
        <li><span class="emoji">🔒</span> <strong>HTTPS:</strong> Usar conexiones seguras en producción</li>
    </ul>

    <h2>🚀 Mejores Prácticas</h2>

    <h3>Gestión Eficiente</h3>

    <div class="feature-grid">
        <div class="feature-card">
            <h4>📝 Formularios Completos</h4>
            <p>Siempre completa todos los campos obligatorios para evitar problemas de validación.</p>
        </div>
        
        <div class="feature-card">
            <h4>🏷️ Especialidades Claras</h4>
            <p>Usa nombres de especialidades consistentes y separadas por comas sin espacios extra.</p>
        </div>
        
        <div class="feature-card">
            <h4>💰 Precios Realistas</h4>
            <p>Establece precios dentro del rango de mercado ($30-$300) en incrementos de $5.</p>
        </div>
        
        <div class="feature-card">
            <h4>📊 Monitoreo Regular</h4>
            <p>Revisa las estadísticas periódicamente para entender el crecimiento del sistema.</p>
        </div>
    </div>

    <h3>Mantenimiento Recomendado</h3>

    <ul>
        <li><span class="emoji">🔄</span> <strong>Backup periódico:</strong> Aunque los datos son locales, considera exportar datos importantes</li>
        <li><span class="emoji">🧹</span> <strong>Limpieza de datos:</strong> Elimina psicólogos inactivos o con información obsoleta</li>
        <li><span class="emoji">📈</span> <strong>Análisis de uso:</strong> Revisa qué especialidades son más demandadas</li>
        <li><span class="emoji">⚡</span> <strong>Performance:</strong> Si la lista crece mucho, considera implementar paginación</li>
    </ul>

    <h2>📞 Soporte Técnico</h2>

    <h3>Información de Depuración</h3>

    <p>Si necesitas reportar un problema, incluye:</p>

    <ul>
        <li>URL exacta donde ocurrió el problema</li>
        <li>Pasos específicos para reproducir el error</li>
        <li>Mensajes de error mostrados en pantalla</li>
        <li>Logs de la consola del navegador (F12 → Console)</li>
        <li>Navegador y versión utilizada</li>
    </ul>

    <div class="admin-tip">
        Para acceder a los logs técnicos, presiona F12, ve a la pestaña "Application" → "Storage" → "IndexedDB" para ver el estado de la base de datos.
    </div>

    <div class="footer">
        <p><strong>Panel de Administración PsiConnect</strong></p>
        <p>Manual del Administrador v2.0 - 19/1/2025</p>
        <p>Sistema de gestión completo para plataforma de agendamiento psicológico</p>
    </div>
</body>
</html>
`;

async function generateAdminPDF() {
    try {
        console.log('🛠️ Iniciando generación del manual del panel de administración...');
        
        // Lanzar navegador
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Configurar contenido HTML
        await page.setContent(adminManualContent, {
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
        const outputPath = path.join(__dirname, '..', 'Manual-Panel-Administracion-PsiConnect.pdf');
        await page.pdf({
            ...pdfOptions,
            path: outputPath
        });
        
        await browser.close();
        
        console.log('✅ Manual del panel de administración generado exitosamente!');
        console.log('📄 Ubicación:', outputPath);
        console.log('🎉 El archivo está listo para usar.');
        
    } catch (error) {
        console.error('❌ Error al generar el manual del panel:', error);
        process.exit(1);
    }
}

// Ejecutar la función
if (require.main === module) {
    generateAdminPDF();
}

module.exports = generateAdminPDF; 