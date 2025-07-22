# Manual del Panel de Administración - PsiConnect

**Versión:** 1.0  
**Fecha:** 22 de julio de 2025  
**Autor:** Equipo de Desarrollo PsiConnect  
**Tema:** Documentación técnica del CRUD de psicólogos

---

## 📑 Tabla de Contenidos

1. [🛠️ Introducción al Panel de Administración](#introducci-n-al-panel-de-administraci-n)
2. [🏗️ Arquitectura del Sistema](#arquitectura-del-sistema)
3. [📊 Panel Principal - Vista General](#panel-principal-vista-general)
4. [➕ Crear Nuevo Psicólogo](#crear-nuevo-psic-logo)
5. [✏️ Editar Psicólogo Existente](#editar-psic-logo-existente)
6. [🗑️ Eliminar Psicólogo](#eliminar-psic-logo)
7. [🔄 Gestión de Base de Datos](#gesti-n-de-base-de-datos)
8. [⚠️ Manejo de Errores y Solución de Problemas](#manejo-de-errores-y-soluci-n-de-problemas)
9. [🎨 Interfaz de Usuario y Experiencia](#interfaz-de-usuario-y-experiencia)
10. [🔧 Configuración y Instalación](#configuraci-n-y-instalaci-n)
11. [📚 API Reference y Hooks](#api-reference-y-hooks)
12. [🚀 Deployment y Mantenimiento](#deployment-y-mantenimiento)

---


## 1. 🛠️ Introducción al Panel de Administración

El Panel de Administración de PsiConnect es una interfaz completa de gestión que permite
realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre la base de datos de 
psicólogos. Desarrollado con React + TypeScript y Dexie (IndexedDB), proporciona una 
experiencia administrativa robusta y moderna.

## Características Principales:
• Interfaz intuitiva con validación en tiempo real
• Operaciones atómicas para garantizar integridad de datos  
• Manejo avanzado de errores con logging detallado
• Respaldo y restauración de base de datos
• Generación automática de horarios de disponibilidad
• Soporte para múltiples modalidades (Online/Presencial)

## Acceso:
URL: http://localhost:3000/admin
Compatibilidad: Todos los navegadores modernos (Chrome 90+, Firefox 88+, Safari 14+)

---


## 2. 🏗️ Arquitectura del Sistema

## Stack Tecnológico:
• Frontend: React 18.2.0 + TypeScript 4.9.5
• Base de Datos: Dexie 3.2.4 (IndexedDB wrapper)
• Estado: Custom hooks con React Context
• Estilos: CSS modular con variables

## Estructura de la Base de Datos:

### Tabla: psicologos
- id (string): Identificador único
- nombre (string): Nombre del psicólogo
- apellido (string): Apellido del psicólogo  
- experiencia (number): Años de experiencia
- precio (number): Tarifa por sesión
- imagen (string): URL del avatar
- descripcion (string): Descripción profesional
- rating (number): Calificación (1-5)
- modalidades (JSON): Array de modalidades disponibles

### Tabla: especialidades
- id (auto-increment): ID interno
- nombre (string, UNIQUE): Nombre de la especialidad

### Tabla: psicologoEspecialidades
- id (auto-increment): ID interno
- psicologoId (string): Referencia al psicólogo
- especialidad (string): Nombre de la especialidad

### Tabla: horarios
- id (auto-increment): ID interno
- psicologoId (string): Referencia al psicólogo
- fecha (string): Fecha en formato YYYY-MM-DD
- hora (string): Hora en formato HH:MM
- modalidades (JSON): Modalidades disponibles para ese horario
- disponible (boolean): Estado de disponibilidad

### Tabla: sesiones
- id (string): Identificador único de la sesión
- psicologoId (string): Referencia al psicólogo
- fecha (string): Fecha de la sesión
- hora (string): Hora de la sesión
- modalidad (string): Modalidad seleccionada
- pacienteNombre (string): Nombre del paciente
- pacienteEmail (string): Email del paciente
- pacienteTelefono (string): Teléfono del paciente
- especialidad (string): Especialidad solicitada
- estado (string): Estado de la sesión
- created_at (Date): Fecha de creación

---


## 3. 📊 Panel Principal - Vista General

## Interfaz Principal del Admin Panel

### Header del Panel:
🛠️ Panel de Administración
- Título principal con icono
- Descripción: "Gestiona la base de datos de psicólogos"
- Enlace de retorno: "← Volver a la aplicación"

### Sección de Estadísticas:
Tres tarjetas informativas que muestran:

1. 👥 Psicólogos
   - Contador total de psicólogos registrados
   - Actualización en tiempo real

2. 📅 Sesiones  
   - Contador total de sesiones agendadas
   - Incluye todos los estados (confirmada, pendiente, cancelada)

3. 🏷️ Especialidades
   - Contador de especialidades únicas en el sistema
   - Se actualiza automáticamente al agregar nuevas especialidades

### Botones de Acción Principal:
• ✏️ Agregar Nuevo Psicólogo
• 🗑️ Limpiar y Recargar DB (para mantenimiento)

### Lista de Psicólogos:
Tabla responsiva con información resumida:
- Avatar del psicólogo (imagen circular)
- Nombre completo y especialidades
- Metadatos: experiencia, precio, rating
- Contador de horarios disponibles
- Acciones: Editar y Eliminar

---


## 4. ➕ Crear Nuevo Psicólogo

## Formulario de Creación

### Activación:
1. Click en "✏️ Agregar Nuevo Psicólogo"
2. Se despliega formulario modal con fondo oscuro
3. Título: "Agregar Nuevo Psicólogo"

### Campos del Formulario:

#### Información Personal:
• **Nombre**: Campo de texto requerido
  - Validación: No puede estar vacío
  - Placeholder: "Nombre del psicólogo"

• **Apellido**: Campo de texto requerido  
  - Validación: No puede estar vacío
  - Placeholder: "Apellido del psicólogo"

#### Información Profesional:
• **Especialidades**: Campo de texto largo requerido
  - Formato: Separadas por comas
  - Ejemplo: "Ansiedad, Depresión, Terapia Cognitivo-Conductual"
  - Validación: Mínimo una especialidad

• **Experiencia**: Campo numérico requerido
  - Rango: 1-30 años
  - Tipo: Number input con spinner

• **Precio por sesión**: Campo numérico requerido
  - Rango: $30-$300
  - Incrementos: $5
  - Formato: Dólares americanos

#### Modalidades de Atención:
Checkboxes para seleccionar modalidades:
• 💻 Online
• 🏢 Presencial
- Validación: Mínimo una modalidad requerida

#### Descripción:
• **Descripción**: Textarea requerido
  - Placeholder: "Descripción profesional del psicólogo, especialidades, enfoque terapéutico..."
  - Filas: 4
  - Validación: No puede estar vacío

#### Opciones Adicionales:
• **Generar horarios automáticamente**: Checkbox
  - Por defecto: Marcado
  - Si está marcado: Sistema genera horarios aleatorios para 3 semanas
  - Si no está marcado: Psicólogo se crea sin horarios

### Validaciones en Tiempo Real:
- Campos requeridos marcados con asterisco (*)
- Validación al enviar formulario
- Mensajes de error específicos y descriptivos
- Campos con focus reciben bordes azules
- Placeholders informativos

### Botones de Acción:
• **Agregar Psicólogo**: Botón principal (azul)
  - Estado: Deshabilitado durante procesamiento
  - Texto cambia a "Procesando..." durante la operación

• **Cancelar**: Botón secundario (gris)
  - Cierra formulario sin guardar
  - Limpia todos los campos

### Proceso de Creación:
1. Validación de campos requeridos
2. Generación de ID único: psi_[timestamp]_[random]
3. Asignación de rating aleatorio (3.5-5.0)
4. Asignación de imagen por defecto
5. Generación opcional de horarios
6. Inserción en base de datos con transacción atómica
7. Actualización de la lista
8. Mensaje de confirmación
9. Limpieza del formulario

---


## 5. ✏️ Editar Psicólogo Existente

## Proceso de Edición

### Activación:
1. Localizar psicólogo en la lista
2. Click en botón "✏️ Editar" 
3. Se carga formulario con datos existentes

### Diferencias con Creación:
• Título: "Editar Psicólogo"
• Campos pre-populados con información actual
• Especialidades mostradas como texto separado por comas
• Modalidades pre-seleccionadas según configuración actual
• Sin opción de generar horarios automáticamente

### Campos Editables:
- Todos los campos del formulario de creación
- Mantiene ID original del psicólogo
- Preserva rating y imagen existentes
- Actualiza timestamp de modificación

### Validaciones:
- Mismas validaciones que en creación
- Verificación de que el ID existe en la base de datos
- Comprobación de cambios antes de guardar

### Proceso de Actualización:
1. Validación de campos modificados
2. Comparación con datos originales
3. Actualización de tabla principal (psicologos)
4. Eliminación de relaciones de especialidades existentes
5. Inserción de nuevas especialidades y relaciones
6. Eliminación de horarios existentes
7. Inserción de horarios actualizados (si los hay)
8. Confirmación de transacción
9. Actualización de la interfaz
10. Mensaje de éxito

### Manejo de Errores:
- Validación de ID existente
- Manejo de especialidades duplicadas
- Rollback automático en caso de error
- Logging detallado para debugging
- Mensajes específicos al usuario

### Botones de Acción:
• **Actualizar Psicólogo**: Botón principal
• **Cancelar**: Vuelve a lista sin cambios

---


## 6. 🗑️ Eliminar Psicólogo

## Proceso de Eliminación

### Activación:
1. Localizar psicólogo en la lista
2. Click en botón "🗑️ Eliminar" (rojo)
3. Aparece dialog de confirmación

### Dialog de Confirmación:
- Título: Confirmación requerida
- Mensaje: "¿Estás seguro de que quieres eliminar a [Nombre Apellido]? Esta acción no se puede deshacer."
- Botones:
  • "Cancelar": Cierra dialog sin acción
  • "Eliminar": Procede con eliminación

### Operaciones de Eliminación:
La eliminación es una operación CASCADE que incluye:

1. **Tabla psicologos**: Eliminación del registro principal
2. **Tabla psicologoEspecialidades**: Eliminación de todas las relaciones
3. **Tabla horarios**: Eliminación de todos los horarios del psicólogo  
4. **Tabla sesiones**: Eliminación de sesiones asociadas

### Proceso Transaccional:
1. Inicio de transacción atómica
2. Verificación de existencia del psicólogo
3. Eliminación en orden inverso de dependencias:
   - Sesiones del psicólogo
   - Horarios del psicólogo
   - Relaciones de especialidades
   - Registro principal del psicólogo
4. Commit de transacción
5. Actualización de interfaz
6. Mensaje de confirmación

### Seguridad:
- Confirmación explícita requerida
- Operación irreversible claramente indicada
- Logging de todas las eliminaciones
- Manejo de errores robusto

### Estados del Botón:
- Normal: Botón rojo con icono 🗑️
- Procesando: Deshabilitado con texto "Procesando..."
- Error: Mensaje de error específico

### Casos de Error:
- Psicólogo no encontrado
- Error de transacción de base de datos
- Problemas de integridad referencial
- Errores de conexión

### Recuperación:
- No hay recuperación automática
- Requiere restauración desde backup
- Recomendación: Usar "Limpiar y Recargar DB" para reset completo

---


## 7. 🔄 Gestión de Base de Datos

## Funcionalidades de Mantenimiento

### Limpiar y Recargar Base de Datos:
Botón especial para mantenimiento del sistema.

#### Activación:
1. Click en "🗑️ Limpiar y Recargar DB"
2. Dialog de confirmación con advertencia
3. Mensaje: "¿Estás seguro de que quieres limpiar y recargar toda la base de datos? Esto eliminará todos los datos y los volverá a importar."

#### Proceso de Limpieza:
1. **Limpieza Completa**: Eliminación de todas las tablas
   - psicologos.clear()
   - especialidades.clear()  
   - psicologoEspecialidades.clear()
   - horarios.clear()
   - sesiones.clear()

2. **Re-importación**: Carga de datos iniciales
   - Lectura de archivo src/data/psicologos.ts
   - Migración automática de 5 psicólogos predefinidos
   - Generación de horarios de disponibilidad
   - Creación de especialidades y relaciones

3. **Verificación**: Comprobación de integridad
   - Conteo de registros importados
   - Validación de relaciones
   - Verificación de índices

4. **Recarga**: Actualización completa de la aplicación
   - window.location.reload() automático
   - Reinicialización de estado
   - Recarga de datos en interfaz

#### Casos de Uso:
- Corrupción de datos en IndexedDB
- Errores de integridad referencial
- Reset para desarrollo y testing
- Limpieza de datos de prueba
- Restauración a estado inicial

#### Consideraciones:
- **Irreversible**: Todos los datos personalizados se pierden
- **Tiempo**: Proceso puede tomar varios segundos
- **Conexión**: Requiere acceso a archivos locales
- **Estado**: Aplicación queda en estado inicial

### Monitoreo de Estadísticas:
El panel muestra estadísticas en tiempo real:
- Actualización automática después de cada operación
- Contadores precisos con validación
- Sincronización con base de datos

### Logging y Debugging:
Todas las operaciones generan logs detallados:
- Console.log para operaciones exitosas (✅)
- Console.warn para advertencias (⚠️)  
- Console.error para errores (❌)
- Información de timestamps
- Detalles de transacciones

### Backup Manual (Recomendado):
Para preservar datos personalizados:
1. Exportar datos antes de operaciones destructivas
2. Usar herramientas de desarrollador del navegador
3. Respaldar IndexedDB manualmente
4. Considerar implementar exportación automática

---


## 8. ⚠️ Manejo de Errores y Solución de Problemas

## Sistema de Manejo de Errores

### Tipos de Errores Comunes:

#### 1. Errores de Validación:
- **Campos requeridos vacíos**
  - Error: "El nombre es requerido"
  - Solución: Completar todos los campos marcados con *

- **Especialidades inválidas**
  - Error: "Debes agregar al menos una especialidad"
  - Solución: Escribir especialidades separadas por comas

- **Modalidades no seleccionadas**
  - Error: "Debes seleccionar al menos una modalidad"
  - Solución: Marcar al menos una checkbox de modalidad

#### 2. Errores de Base de Datos:
- **Restricción de unicidad**
  - Error: "Unable to add key to index 'nombre': at least one key does not satisfy the uniqueness requirements"
  - Solución: Usar botón "Limpiar y Recargar DB"

- **Psicólogo no encontrado**
  - Error: "No se encontró el psicólogo con ID: [id]"
  - Solución: Verificar que el psicólogo existe, refrescar lista

- **Error de transacción**
  - Error: "Error al insertar psicólogo: [detalle]"
  - Solución: Revisar console.log, verificar datos, reintentar

#### 3. Errores de Interfaz:
- **Formulario no responsivo**
  - Solución: Verificar que no hay overlays modales múltiples
  - Presionar Escape para cerrar modales

- **Datos no actualizados**
  - Solución: Refrescar página o usar "Limpiar y Recargar DB"

### Estrategias de Solución:

#### Nivel 1 - Soluciones Básicas:
1. **Refrescar página**: F5 o Ctrl+R
2. **Limpiar caché**: Ctrl+Shift+R
3. **Verificar console**: F12 > Console tab
4. **Completar campos requeridos**: Revisar asteriscos

#### Nivel 2 - Soluciones Intermedias:
1. **Limpiar y Recargar DB**: Botón en panel admin
2. **Cerrar/abrir formularios**: Cancelar y reintentar
3. **Verificar formato de datos**: Especialidades con comas
4. **Revisar modalidades**: Seleccionar al menos una

#### Nivel 3 - Soluciones Avanzadas:
1. **Limpiar IndexedDB manualmente**:
   - F12 > Application > Storage > IndexedDB
   - Eliminar base de datos "PsiConnectDB"
   - Refrescar aplicación

2. **Modo incógnito**: Probar en ventana privada
3. **Diferentes navegador**: Chrome, Firefox, Edge
4. **Verificar JavaScript**: Asegurar que está habilitado

### Mensajes de Estado:

#### Mensajes de Éxito (Verde):
- "✅ Psicólogo [nombre] agregado exitosamente"
- "✅ Psicólogo [nombre] actualizado exitosamente"  
- "✅ Psicólogo [nombre] eliminado exitosamente"
- "✅ Base de datos limpiada y recargada exitosamente"

#### Mensajes de Error (Rojo):
- "❌ Error al agregar el psicólogo: [detalle]"
- "❌ Error al actualizar el psicólogo: [detalle]"
- "❌ Error al eliminar el psicólogo"
- "❌ Error al limpiar la base de datos"

### Logging Detallado:
Todos los errores se registran en console con:
- Timestamp exacto
- Operación que falló
- Datos involucrados
- Stack trace completo
- Sugerencias de solución

### Prevención de Errores:
- Validación en tiempo real
- Confirmaciones para operaciones destructivas
- Transacciones atómicas
- Rollback automático
- Estados de carga claros
- Deshabilitación de botones durante procesamiento

---


## 9. 🎨 Interfaz de Usuario y Experiencia

## Diseño y Usabilidad

### Esquema de Colores:
- **Fondos**: Negro semi-transparente (rgba(0, 0, 0, 0.6))
- **Bordes**: Blanco semi-transparente (rgba(255, 255, 255, 0.3))
- **Texto**: Blanco puro para máximo contraste
- **Botones primarios**: Gradiente azul (#3498db → #2980b9)
- **Botones de edición**: Gradiente naranja (#f39c12 → #e67e22)
- **Botones de eliminación**: Gradiente rojo (#e74c3c → #c0392b)
- **Botones secundarios**: Gradiente gris (#95a5a6 → #7f8c8d)

### Tipografía:
- **Familia**: System fonts (Arial, sans-serif)
- **Tamaños**:
  - H1: 2.5rem (títulos principales)
  - H3: 1.2rem (subtítulos)
  - Texto: 14px (contenido general)
  - Small: 12px (metadatos y ayudas)

### Efectos Visuales:
- **Backdrop filter**: blur(10px) para efecto de vidrio
- **Box shadows**: Sombras suaves para profundidad
- **Transitions**: Animaciones suaves de 0.3s
- **Hover effects**: Elevación y cambio de color
- **Focus states**: Bordes azules con glow

### Iconografía:
- ✏️ Crear/Editar
- 🗑️ Eliminar
- 👥 Psicólogos  
- 📅 Sesiones
- 🏷️ Especialidades
- 💻 Online
- 🏢 Presencial
- ✅ Éxito
- ❌ Error
- ⚠️ Advertencia
- ℹ️ Información

### Layout Responsivo:

#### Desktop (1200px+):
- Formulario: 2 columnas
- Lista: Tabla completa
- Botones: Tamaño estándar
- Espaciado: Amplio

#### Tablet (768px - 1199px):
- Formulario: 1 columna
- Lista: Tabla adaptada
- Botones: Tamaño medio
- Espaciado: Reducido

#### Mobile (< 768px):
- Formulario: Stack vertical
- Lista: Cards verticales
- Botones: Ancho completo
- Espaciado: Mínimo

### Feedback Visual:

#### Estados de Botones:
- **Normal**: Color base con hover effect
- **Hover**: Elevación y saturación
- **Focus**: Borde azul con outline
- **Disabled**: Opacidad 60%, sin interacción
- **Loading**: Spinner o texto "Procesando..."

#### Estados de Campos:
- **Normal**: Borde semi-transparente
- **Focus**: Borde azul con glow
- **Error**: Borde rojo con mensaje
- **Valid**: Borde verde sutil

#### Mensajes de Estado:
- **Posicionamiento**: Top del panel, debajo del header
- **Duración**: 5 segundos auto-dismiss
- **Animación**: Slide down from top
- **Persistencia**: Hasta nueva acción

### Accesibilidad:

#### Keyboard Navigation:
- Tab order lógico
- Enter para confirmar
- Escape para cancelar
- Flechas para navegación

#### Screen Readers:
- Labels asociados correctamente
- Aria-labels descriptivos
- Role attributes apropiados
- Live regions para cambios dinámicos

#### Color Contrast:
- Ratio mínimo 4.5:1 para texto normal
- Ratio mínimo 3:1 para texto grande
- Estados de focus claramente visibles
- Sin dependencia únicamente del color

### Performance:

#### Optimizaciones:
- CSS transforms para animaciones
- Debounce en campos de búsqueda
- Lazy loading de componentes
- Memoization de cálculos costosos

#### Métricas Objetivo:
- First Paint: < 1s
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Cumulative Layout Shift: < 0.1

---


## 10. 🔧 Configuración y Instalación

## Requisitos del Sistema

### Navegadores Soportados:
- **Chrome**: 90+ (recomendado)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Requisitos de Desarrollo:
- **Node.js**: 16.0.0 o superior
- **npm**: 7.0.0 o superior
- **Git**: Para control de versiones
- **Editor**: VS Code recomendado

### Instalación:

#### 1. Clonar Repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd psi-mammoliti
```

#### 2. Instalar Dependencias:
```bash
npm install
```

#### 3. Ejecutar en Desarrollo:
```bash
npm start
```

#### 4. Acceder al Panel:
- Aplicación principal: http://localhost:3000
- Panel de administración: http://localhost:3000/admin

### Configuración del Entorno:

#### Variables de Entorno:
Crear archivo .env.local en la raíz:
```
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

#### Scripts Disponibles:
- `npm start`: Servidor de desarrollo
- `npm build`: Build de producción
- `npm test`: Ejecutar tests
- `npm run lint`: Verificar código
- `npm run lint:fix`: Corregir errores automáticamente

### Estructura de Archivos del Admin:

#### Componentes Principales:
```
src/components/Admin.tsx          # Componente principal
src/hooks/useDatabase.ts          # Hook de base de datos
src/database/database.ts          # Servicio Dexie
src/database/migration.ts         # Migración inicial
```

#### Tipos y Interfaces:
```
src/types/index.ts               # Definiciones TypeScript
```

#### Utilidades:
```
src/utils/horarioGenerator.ts   # Generador de horarios
src/utils/timezone.ts           # Manejo de zonas horarias
```

### Configuración de Base de Datos:

#### IndexedDB Setup:
- Nombre de DB: "PsiConnectDB"
- Versión: 1
- Tamaño máximo: ~250MB (límite del navegador)
- Persistencia: Local storage del navegador

#### Esquema Inicial:
La base de datos se inicializa automáticamente con:
- 5 psicólogos de ejemplo
- 16 especialidades predefinidas
- Horarios aleatorios para 3 semanas
- Relaciones completamente configuradas

### Troubleshooting de Instalación:

#### Error: npm install falla
**Solución:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Error: Puerto 3000 ocupado
**Solución:**
```bash
# Encontrar proceso usando puerto 3000
netstat -ano | findstr :3000
# Terminar proceso (reemplazar PID)
taskkill /PID [PID_NUMBER] /F
# O usar puerto diferente
npm start -- --port 3001
```

#### Error: TypeScript compilation
**Solución:**
```bash
# Verificar versión de TypeScript
npx tsc --version
# Reinstalar dependencias
npm install typescript @types/react @types/react-dom --save-dev
```

#### Error: IndexedDB no soportado
**Verificación:**
```javascript
if (!window.indexedDB) {
  console.error('Tu navegador no soporta IndexedDB');
}
```

### Configuración de Producción:

#### Build Optimizado:
```bash
npm run build
```

#### Servidor Estático:
```bash
npm install -g serve
serve -s build -p 5000
```

#### Variables de Producción:
```
REACT_APP_ENV=production
REACT_APP_DEBUG=false
```

### Monitoreo y Logs:

#### Desarrollo:
- Console.log para debugging
- React DevTools para componentes
- Dexie DevTools para base de datos

#### Producción:
- Error boundaries para captura de errores
- Analytics para tracking de uso
- Monitoring de performance

---


## 11. 📚 API Reference y Hooks

## useDatabase Hook

### Importación:
```typescript
import { useDatabase } from '../hooks/useDatabase';
```

### Estructura de Retorno:
```typescript
const {
  // Datos
  psicologos,              // Psicologo[]
  sesiones,                // Sesion[]
  especialidades,          // string[]
  
  // Estado
  loading,                 // boolean
  error,                   // string | null
  initialized,             // boolean
  
  // Métodos CRUD
  insertarPsicologo,       // (psicologo: Psicologo) => Promise<boolean>
  actualizarPsicologo,     // (psicologo: Psicologo) => Promise<boolean>
  eliminarPsicologo,       // (id: string) => Promise<boolean>
  insertarSesion,          // (sesion: Sesion) => Promise<boolean>
  
  // Utilidades
  refrescar,               // () => Promise<void>
  filtrarPsicologos,       // (especialidad?, precio?, modalidad?) => Psicologo[]
  obtenerPsicologoPorId,   // (id: string) => Psicologo | null
  obtenerSesionesPorPsicologo, // (psicologoId: string) => Sesion[]
  limpiarError,            // () => void
  
  // Estadísticas
  stats                    // { totalPsicologos, totalSesiones, especialidadesUnicas }
} = useDatabase();
```

## DatabaseService API

### Métodos CRUD de Psicólogos:

#### obtenerPsicologos()
```typescript
const psicologos = await db.obtenerPsicologos();
// Retorna: Promise<Psicologo[]>
// Incluye disponibilidad y especialidades relacionadas
```

#### insertarPsicologo(psicologo)
```typescript
await db.insertarPsicologo({
  id: 'psi_123_abc',
  nombre: 'Juan',
  apellido: 'Pérez',
  especialidades: ['Ansiedad', 'Depresión'],
  experiencia: 5,
  precio: 75,
  descripcion: 'Especialista en...',
  rating: 4.5,
  modalidades: ['online', 'presencial'],
  disponibilidad: [...],
  imagen: 'https://...'
});
// Retorna: Promise<void>
// Lanza: Error si validación falla
```

#### actualizarPsicologo(psicologo)
```typescript
await db.actualizarPsicologo(psicologoModificado);
// Retorna: Promise<void>
// Actualiza transaccionalmente todas las tablas relacionadas
```

#### eliminarPsicologo(id)
```typescript
await db.eliminarPsicologo('psi_123_abc');
// Retorna: Promise<void>
// Eliminación CASCADE de datos relacionados
```

### Métodos de Sesiones:

#### obtenerSesiones()
```typescript
const sesiones = await db.obtenerSesiones();
// Retorna: Promise<Sesion[]>
// Ordenadas por fecha descendente
```

#### insertarSesion(sesion)
```typescript
await db.insertarSesion({
  id: 'ses_123',
  psicologoId: 'psi_123',
  fecha: '2025-01-20',
  hora: '14:00',
  modalidad: 'online',
  paciente: {
    nombre: 'Ana García',
    email: 'ana@email.com',
    telefono: '+1234567890'
  },
  especialidad: 'Ansiedad',
  estado: 'confirmada'
});
```

### Métodos de Utilidad:

#### obtenerEspecialidades()
```typescript
const especialidades = await db.obtenerEspecialidades();
// Retorna: Promise<string[]>
// Lista única ordenada alfabéticamente
```

#### limpiarBaseDatos()
```typescript
await db.limpiarBaseDatos();
// Retorna: Promise<void>
// Elimina TODOS los datos de TODAS las tablas
```

#### obtenerEstadisticas()
```typescript
const stats = await db.obtenerEstadisticas();
// Retorna: Promise<{
//   totalPsicologos: number,
//   totalSesiones: number,
//   totalEspecialidades: number
// }>
```

## Validaciones

### Validaciones de Psicologo:
```typescript
// ID requerido y único
if (!psicologo.id) throw new Error('ID requerido');

// Nombre y apellido requeridos
if (!psicologo.nombre?.trim()) throw new Error('Nombre requerido');
if (!psicologo.apellido?.trim()) throw new Error('Apellido requerido');

// Especialidades: mínimo una
if (!psicologo.especialidades?.length) throw new Error('Mínimo una especialidad');

// Modalidades: mínimo una
if (!psicologo.modalidades?.length) throw new Error('Mínimo una modalidad');

// Experiencia: 1-30 años
if (psicologo.experiencia < 1 || psicologo.experiencia > 30) 
  throw new Error('Experiencia debe estar entre 1 y 30 años');

// Precio: $30-$300
if (psicologo.precio < 30 || psicologo.precio > 300)
  throw new Error('Precio debe estar entre $30 y $300');
```

### Validaciones de Sesion:
```typescript
// Todos los campos requeridos
if (!sesion.psicologoId || !sesion.fecha || !sesion.hora || 
    !sesion.modalidad || !sesion.especialidad)
  throw new Error('Campos requeridos faltantes');

// Datos del paciente
if (!sesion.paciente.nombre || !sesion.paciente.email)
  throw new Error('Datos del paciente incompletos');

// Email válido
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(sesion.paciente.email))
  throw new Error('Email inválido');
```

## Error Handling

### Tipos de Errores:
```typescript
// Error de validación
class ValidationError extends Error {
  constructor(message: string) {
    super(`Validación: ${message}`);
    this.name = 'ValidationError';
  }
}

// Error de base de datos
class DatabaseError extends Error {
  constructor(message: string, cause?: Error) {
    super(`Base de datos: ${message}`);
    this.name = 'DatabaseError';
    this.cause = cause;
  }
}

// Error de constraint único
class UniqueConstraintError extends DatabaseError {
  constructor(field: string, value: string) {
    super(`Valor duplicado en ${field}: ${value}`);
    this.name = 'UniqueConstraintError';
  }
}
```

### Manejo en Componentes:
```typescript
try {
  const exito = await insertarPsicologo(nuevoPsicologo);
  if (exito) {
    mostrarMensaje('✅ Psicólogo creado exitosamente');
  } else {
    mostrarMensaje('❌ Error al crear psicólogo', 'error');
  }
} catch (error) {
  console.error('Error:', error);
  mostrarMensaje(`❌ ${error.message}`, 'error');
}
```

---


## 12. 🚀 Deployment y Mantenimiento

## Preparación para Producción

### Build de Producción:
```bash
# Crear build optimizado
npm run build

# Verificar archivos generados
ls -la build/

# Tamaño típico del bundle
du -sh build/
# Esperado: ~2-3MB total
```

### Optimizaciones Automáticas:
- **Minificación**: JavaScript y CSS comprimidos
- **Tree shaking**: Eliminación de código no utilizado  
- **Code splitting**: Carga bajo demanda
- **Asset optimization**: Imágenes y fuentes optimizadas
- **Gzip compression**: Compresión adicional del servidor

### Variables de Entorno de Producción:
```env
# .env.production
REACT_APP_ENV=production
REACT_APP_DEBUG=false
REACT_APP_VERSION=1.0.0
REACT_APP_API_URL=https://api.psiconnect.com
GENERATE_SOURCEMAP=false
```

### Deployment en Diferentes Plataformas:

#### Netlify:
```bash
# Installar Netlify CLI
npm install -g netlify-cli

# Deploy manual
npm run build
netlify deploy --prod --dir=build

# Deploy automático con Git
# Conectar repositorio en netlify.com
# Build command: npm run build
# Publish directory: build
```

#### Vercel:
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configuración automática para React
# vercel.json no necesario para casos básicos
```

#### Apache/Nginx:
```nginx
# nginx.conf para SPA
server {
    listen 80;
    server_name psiconnect.com;
    root /var/www/psiconnect/build;
    index index.html;

    # Manejar rutas de React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

## Mantenimiento y Monitoreo

### Backup de Datos:
Aunque IndexedDB es local, es importante ofrecer funcionalidades de backup:

```typescript
// Exportar datos para backup
async function exportarDatos() {
  const db = DatabaseService.getInstance();
  const datos = {
    psicologos: await db.obtenerPsicologos(),
    sesiones: await db.obtenerSesiones(),
    timestamp: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(datos, null, 2)], 
    { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `psiconnect-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

// Importar datos desde backup
async function importarDatos(file: File) {
  const text = await file.text();
  const datos = JSON.parse(text);
  
  const db = DatabaseService.getInstance();
  await db.limpiarBaseDatos();
  
  for (const psicologo of datos.psicologos) {
    await db.insertarPsicologo(psicologo);
  }
  
  for (const sesion of datos.sesiones) {
    await db.insertarSesion(sesion);
  }
}
```

### Monitoring y Analytics:

#### Google Analytics 4:
```typescript
// analytics.ts
import { gtag } from 'ga-gtag';

export const trackEvent = (action: string, category: string, label?: string) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
  });
};

// Uso en Admin Panel
trackEvent('create_psychologist', 'admin', psicologo.especialidades.join(','));
trackEvent('delete_psychologist', 'admin', psicologo.id);
```

#### Error Tracking (Sentry):
```typescript
// sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_ENV
});

// Uso automático en DatabaseService
catch (error) {
  console.error('Error en base de datos:', error);
  Sentry.captureException(error, {
    tags: {
      component: 'DatabaseService',
      operation: 'insertarPsicologo'
    }
  });
  throw error;
}
```

### Performance Monitoring:

#### Core Web Vitals:
```typescript
// performance.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  gtag('event', metric.name, {
    event_category: 'Web Vitals',
    value: Math.round(metric.value),
    event_label: metric.id,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Actualizaciones y Versionado:

#### Semantic Versioning:
- **MAJOR** (1.0.0 → 2.0.0): Cambios breaking
- **MINOR** (1.0.0 → 1.1.0): Nuevas funcionalidades
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

#### Process de Actualización:
1. **Testing**: Verificar en entorno de desarrollo
2. **Staging**: Deploy en ambiente de pruebas
3. **Backup**: Exportar datos antes de actualizar
4. **Deploy**: Subir nueva versión
5. **Monitoring**: Vigilar errores post-deploy
6. **Rollback**: Plan de reversión si es necesario

### Mantenimiento de IndexedDB:

#### Limpieza Automática:
```typescript
// Limpiar sesiones antigas
async function limpiarSesionesAntiguas() {
  const fechaLimite = new Date();
  fechaLimite.setMonth(fechaLimite.getMonth() - 6); // 6 meses atrás
  
  await db.sesiones
    .where('fecha')
    .below(fechaLimite.toISOString().split('T')[0])
    .delete();
}

// Ejecutar mensualmente
setInterval(limpiarSesionesAntiguas, 30 * 24 * 60 * 60 * 1000);
```

#### Verificación de Integridad:
```typescript
async function verificarIntegridad() {
  const psicologos = await db.obtenerPsicologos();
  const huerfanos = [];
  
  for (const psicologo of psicologos) {
    const especialidades = await db.psicologoEspecialidades
      .where('psicologoId')
      .equals(psicologo.id)
      .count();
      
    if (especialidades === 0) {
      huerfanos.push(psicologo.id);
    }
  }
  
  if (huerfanos.length > 0) {
    console.warn('Psicólogos sin especialidades:', huerfanos);
  }
}
```

### Documentación para Usuarios:

#### Manual de Usuario:
- Guía visual del panel de administración
- Videos tutoriales de cada funcionalidad
- FAQ de problemas comunes
- Contacto para soporte técnico

#### Training Materials:
- Onboarding para nuevos administradores
- Best practices para gestión de datos
- Procedimientos de backup y recovery
- Troubleshooting avanzado

---


## 📞 Soporte y Contacto

Para consultas técnicas sobre el Panel de Administración:
- **Email**: soporte@psiconnect.com  
- **Documentación**: [GitHub Repository](https://github.com/psi-mammoliti)
- **Issues**: Reportar bugs en GitHub Issues
- **Updates**: Seguir releases en GitHub

---

*Documento generado automáticamente por generate-admin-manual.js*  
*© 2025 PsiConnect - Todos los derechos reservados*
