# 🧠 PsiConnect - Plataforma de Agendamiento de Sesiones Psicológicas

## 📋 Descripción General

PsiConnect es una aplicación web moderna desarrollada en React + TypeScript que permite a los pacientes encontrar y agendar sesiones con psicólogos especializados. La plataforma incluye funcionalidades avanzadas como visualización de disponibilidad en calendario semanal, adaptación automática de horarios según zona horaria del usuario, sistema completo de filtrado, **base de datos local con IndexedDB**, **panel de administración completo**, y **sistema CRUD para gestión de psicólogos**.

## 🎯 Objetivos del Proyecto

- **Facilitar la conexión** entre pacientes y psicólogos especializados
- **Simplificar el proceso de agendamiento** con una interfaz intuitiva
- **Adaptar automáticamente los horarios** según la ubicación del usuario
- **Proporcionar información detallada** sobre especialidades y disponibilidad
- **Ofrecer una experiencia visual atractiva** y profesional
- **Gestionar de forma completa** la base de datos de psicólogos
- **Persistir datos localmente** para una experiencia sin interrupciones

## ⚡ Funcionalidades Principales

### 🔍 Búsqueda y Filtrado de Psicólogos
- **Filtro por especialidad**: Ansiedad, Depresión, Terapia Familiar, Psicología Infantil, etc.
- **Filtro por precio máximo**: Slider interactivo de $30 a $300
- **Filtro por modalidad**: Online, Presencial o ambas
- **Filtro por disponibilidad**: Selección por fecha específica
- **Visualización de resultados en tiempo real**

### 🛠️ Panel de Administración (/admin)
- **Gestión completa de psicólogos**: CRUD completo (Crear, Leer, Actualizar, Eliminar)
- **Formulario de nuevo psicólogo**: Con validaciones completas
- **Edición en línea**: Modificación directa de perfiles existentes
- **Generación automática de horarios**: Sistema inteligente de disponibilidad
- **Gestión de especialidades**: Creación y asignación dinámica
- **Configuración de modalidades**: Online y/o presencial
- **Estadísticas del sistema**: Contadores de psicólogos, sesiones y especialidades

### 💾 Sistema de Base de Datos Local
- **IndexedDB con Dexie**: Persistencia local de datos
- **Migración automática**: Importación inicial de datos
- **Transacciones ACID**: Garantía de consistencia de datos
- **Relaciones normalizadas**: Especialidades y horarios relacionados
- **Índices optimizados**: Búsquedas rápidas y eficientes
- **Limpieza y recarga**: Herramientas de mantenimiento de BD

### 👥 Perfiles de Psicólogos
Cada psicólogo muestra:
- **Información personal**: Nombre, apellido, foto
- **Experiencia profesional**: Años de experiencia
- **Rating y valoraciones**: Sistema de estrellas
- **Especialidades**: Tags de áreas de especialización
- **Precio por sesión**: Tarifa claramente visible
- **Disponibilidad**: Preview de próximos horarios con conversión de zona horaria

### 📅 Sistema de Calendario Avanzado
- **Vista semanal completa**: 7 días con navegación entre semanas
- **Horarios por día**: Visualización clara de slots disponibles
- **Adaptación automática de zona horaria**: Muestra horarios locales del usuario
- **Identificación visual**: 
  - Día actual resaltado
  - Fechas pasadas marcadas como no disponibles
  - Horarios seleccionados destacados
- **Leyenda de colores**: Para facilitar la comprensión

### 📝 Proceso de Agendamiento
- **Selección de horario**: Click directo en el calendario
- **Formulario de datos personales**: Nombre, email, teléfono
- **Selección de especialidad**: Dropdown con especialidades del psicólogo
- **Confirmación de datos**: Resumen completo antes de confirmar
- **Navegación dual**: Vista calendario ↔ Vista formulario

### 🌍 Adaptación de Zona Horaria
- **Detección automática**: Del timezone del usuario
- **Conversión de horarios**: Muestra tanto hora del psicólogo como hora local
- **Información clara**: Indica explícitamente las zonas horarias
- **Soporte internacional**: Para usuarios en diferentes países

### 📊 Gestión de Sesiones Agendadas
- **Lista de sesiones**: Visualización completa de citas programadas
- **Información detallada**: Fecha, hora, psicólogo, especialidad, precio
- **Estados de sesión**: Confirmada, pendiente, cancelada
- **Datos del paciente**: Información de contacto

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- **Frontend**: React 18.2.0 + TypeScript 4.9.5
- **Base de Datos**: IndexedDB con Dexie 3.2.4
- **Routing**: React Router DOM 6.3.0
- **Bundler**: Create React App (react-scripts 5.0.1)
- **Estilos**: CSS Variables + CSS Grid/Flexbox
- **Linting**: ESLint 8.42.0 + plugins para TypeScript y React
- **Control de versiones**: Git + GitHub

### Estructura del Proyecto
```
src/
├── components/           # Componentes React reutilizables
│   ├── Admin.tsx                       # Panel de administración
│   ├── CalendarioDisponibilidad.tsx    # Calendario semanal
│   ├── FiltrosBusqueda.tsx             # Panel de filtros
│   ├── ModalAgendamiento.tsx           # Modal de agendamiento
│   ├── PsicologoCard.tsx               # Tarjeta de psicólogo
│   └── SesionesAgendadas.tsx           # Lista de sesiones
├── data/                 # Datos mock y configuración
│   └── psicologos.ts                   # Lista inicial de psicólogos
├── database/            # Capa de persistencia
│   ├── database.ts                     # Servicio de base de datos
│   └── migration.ts                    # Migración y carga inicial
├── hooks/               # React Hooks personalizados
│   └── useDatabase.ts                  # Hook para operaciones CRUD
├── types/               # Definiciones TypeScript
│   └── index.ts                        # Interfaces y tipos
├── utils/               # Utilidades y helpers
│   ├── horarioGenerator.ts             # Generador de horarios
│   └── timezone.ts                     # Funciones de zona horaria
├── App.tsx              # Componente principal con routing
├── App.css              # Estilos globales
└── index.tsx            # Punto de entrada
```

### Tipos de Datos Principales

#### Psicologo
```typescript
interface Psicologo {
  id: string;
  nombre: string;
  apellido: string;
  especialidades: string[];
  experiencia: number;
  precio: number;
  imagen: string;
  descripcion: string;
  rating: number;
  modalidades: Modalidad[];
  disponibilidad: HorarioDisponible[];
}
```

#### HorarioDisponible
```typescript
interface HorarioDisponible {
  fecha: string;
  horarios: HorarioModalidad[];
}

interface HorarioModalidad {
  hora: string;
  modalidades: Modalidad[];
}
```

#### Sesion
```typescript
interface Sesion {
  id: string;
  psicologoId: string;
  fecha: string;
  hora: string;
  modalidad: Modalidad;
  paciente: {
    nombre: string;
    email: string;
    telefono: string;
  };
  especialidad: string;
  estado: 'confirmada' | 'pendiente' | 'cancelada';
}
```

#### FiltrosBusqueda
```typescript
interface FiltrosBusqueda {
  especialidad: string;
  precioMax: number;
  disponibilidad: string;
  modalidad: Modalidad | '';
}
```

## 🎨 Diseño y UX

### Paleta de Colores
- **Primarios**: Tonos lilas (#8475b3, #665090, #4a3d73)
- **Secundarios**: Rosa (#f188a6), Celeste (#98c4e8), Naranjo (#f57e2e)
- **Neutrales**: Blanco, grises, azul oscuro para textos

### Principios de Diseño
- **Minimalismo**: Interfaz limpia sin elementos innecesarios
- **Accesibilidad**: Contrastes adecuados y navegación clara
- **Responsividad**: Adaptación a diferentes tamaños de pantalla
- **Feedback visual**: Hover effects, transiciones suaves
- **Consistencia**: Uso coherente de tipografía y espaciado

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 16+ y npm
- Git
- Navegador moderno con soporte para IndexedDB

### Dependencias Principales
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.3.0",
  "typescript": "^4.9.5",
  "dexie": "^3.2.4"
}
```

### Pasos de Instalación
```bash
# 1. Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd psi-mammoliti

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm start

# 4. Abrir en el navegador
# La aplicación estará disponible en http://localhost:3000
# Panel de administración en http://localhost:3000/admin
```

### Primer Uso
1. **Migración automática**: Al cargar por primera vez, se importan datos iniciales
2. **Base de datos local**: Se crea automáticamente en IndexedDB del navegador
3. **Panel público**: Acceso inmediato a búsqueda y agendamiento
4. **Panel admin**: Gestión completa de psicólogos en `/admin`

### Scripts Disponibles
- `npm start` - Ejecutar en modo desarrollo
- `npm run build` - Crear build de producción
- `npm test` - Ejecutar tests
- `npm run lint` - Verificar código con ESLint
- `npm run lint:fix` - Corregir errores de linting automáticamente

## 📱 Casos de Uso

### 1. Búsqueda de Psicólogo Especializado
**Actor**: Paciente
**Flujo**:
1. Ingresa a la aplicación
2. Utiliza filtros (especialidad: "Ansiedad", precio máximo: $80)
3. Visualiza resultados filtrados
4. Revisa perfiles de psicólogos disponibles

### 2. Agendamiento de Sesión
**Actor**: Paciente
**Flujo**:
1. Selecciona un psicólogo de interés
2. Click en "Ver Horarios"
3. Navega por el calendario semanal
4. Selecciona fecha y hora disponible
5. Completa formulario con datos personales
6. Confirma agendamiento
7. Recibe confirmación

### 3. Gestión de Psicólogos (Admin)
**Actor**: Administrador
**Flujo**:
1. Accede a `/admin`
2. Ve estadísticas del sistema (psicólogos, sesiones, especialidades)
3. Crea nuevo psicólogo completando formulario
4. Configura especialidades, modalidades y generación automática de horarios
5. Edita psicólogos existentes
6. Elimina psicólogos (con confirmación)

### 4. Mantenimiento de Base de Datos
**Actor**: Administrador
**Flujo**:
1. Accede al panel de administración
2. Utiliza "Limpiar y Recargar DB" si hay problemas
3. Confirma operación
4. Sistema restaura datos desde archivo base

### 5. Visualización de Citas Agendadas
**Actor**: Paciente
**Flujo**:
1. Click en "Mis Sesiones" en la navegación
2. Visualiza lista completa de sesiones
3. Revisa detalles (fecha, hora, psicólogo, estado)

### 6. Adaptación de Zona Horaria
**Actor**: Usuario internacional
**Flujo**:
1. La aplicación detecta automáticamente su zona horaria
2. Todos los horarios se muestran con conversión local
3. Ve claramente tanto el horario del psicólogo como su horario local

## 🔧 Configuración de Desarrollo

### ESLint
Configurado con:
- Reglas estándar para TypeScript
- Plugins para React y React Hooks
- Advertencias para console.log
- Detección de variables no utilizadas
- Validación de dependencias en useEffect

### Git
- `.gitignore` configurado para ignorar node_modules y archivos temporales
- Estructura de commits clara
- Control de versiones de dependencias con package-lock.json

## 📊 Métricas y Consideraciones

### Performance
- **Componentes optimizados**: Uso de useMemo para cálculos costosos
- **Lazy loading**: Carga de componentes bajo demanda
- **IndexedDB optimizada**: Índices para búsquedas rápidas
- **Transacciones eficientes**: Operaciones batch para mejor rendimiento
- **Bundle size**: Minimizado con Create React App

### Escalabilidad
- **Arquitectura modular**: Componentes reutilizables
- **Tipado fuerte**: TypeScript previene errores en tiempo de desarrollo
- **Separación de responsabilidades**: Lógica de negocio separada de la presentación
- **Base de datos normalizada**: Estructura optimizada para crecimiento
- **Hooks reutilizables**: Lógica de estado centralizada

### Mantenibilidad
- **Código limpio**: Siguiendo principios SOLID
- **Documentación**: Comentarios claros y README detallado
- **Linting**: Estándares de código consistentes
- **Logging detallado**: Trazabilidad de operaciones CRUD
- **Manejo de errores**: Captura y reporte de excepciones

### Seguridad de Datos
- **Validaciones client-side**: Prevención de datos corruptos
- **Transacciones ACID**: Garantía de consistencia
- **Limpieza de datos**: Sanitización de inputs
- **Backup automático**: Datos persistentes en IndexedDB

## 🌍 Consideraciones Internacionales

### Zona Horaria
- Soporte para múltiples zonas horarias
- Detección automática del timezone del usuario
- Conversión precisa de horarios
- Visualización clara de diferencias horarias

### Localización (Preparado para)
- Estructura preparada para múltiples idiomas
- Formato de fechas según configuración regional
- Soporte para diferentes formatos de hora (12h/24h)

## 🔮 Roadmap Futuro

### Funcionalidades Planificadas
- **Sistema de autenticación**: Login/registro de usuarios y roles
- **Backup/Restore**: Exportación e importación de datos
- **Sincronización en la nube**: Backend con API REST
- **Pasarela de pagos**: Integración con Stripe/PayPal
- **Notificaciones**: Email y SMS de recordatorios
- **Video llamadas**: Integración para sesiones online
- **Calificaciones**: Sistema de reviews y comentarios
- **Chat en tiempo real**: Comunicación pre-sesión
- **Reportes**: Dashboards y analytics avanzados

### Mejoras Técnicas
- **Tests unitarios**: Cobertura completa con Jest
- **Tests E2E**: Cypress para testing de flujos completos
- **PWA**: Aplicación web progresiva offline-first
- **Optimización SEO**: Server-side rendering con Next.js
- **Monitoreo**: Analytics y tracking de errores
- **Docker**: Containerización para despliegue
- **CI/CD**: Pipeline de integración continua

### Escalabilidad de Datos
- **Backend REST API**: Migración a base de datos remota
- **Cache inteligente**: Estrategias de sincronización
- **Sharding**: Particionado de datos por región
- **CDN**: Distribución de contenido estático
- **Microservicios**: Arquitectura distribuida

## 📈 Análisis de Valor de Negocio

### Beneficios para Pacientes
- **Acceso 24/7** a información de psicólogos
- **Transparencia** en precios y especialidades
- **Facilidad de agendamiento** sin llamadas telefónicas
- **Adaptación automática** de horarios según ubicación

### Beneficios para Psicólogos
- **Mayor visibilidad** de sus servicios
- **Gestión automatizada** de disponibilidad
- **Reducción de tiempo** en coordinación de citas
- **Acceso a mercado global** con adaptación de zonas horarias

### Métricas de Éxito
- **Tiempo de agendamiento**: Reducido de minutos a segundos
- **Tasa de conversión**: % de visitantes que agendan
- **Satisfacción del usuario**: Medida a través de UX
- **Retención**: Usuarios que regresan a la plataforma

## 🛠️ Soporte y Mantenimiento

### Requisitos del Sistema
- **Navegadores soportados**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Dispositivos**: Desktop, tablet, móvil
- **Resoluciones**: Desde 320px hasta 1920px+

### Procedimientos de Despliegue
- Build de producción optimizado
- Verificación de linting antes del deploy
- Testing de funcionalidades críticas
- Monitoreo post-despliegue

---

## 🏆 Características Implementadas

### ✅ Sistema Completo de CRUD
- **Gestión de Psicólogos**: Crear, editar, eliminar con validaciones
- **Base de Datos Local**: IndexedDB con Dexie para persistencia
- **Panel de Administración**: Interfaz completa de gestión
- **Migraciones**: Sistema de importación y actualización de datos

### ✅ Funcionalidades Avanzadas
- **Generación de Horarios**: Sistema automático de disponibilidad
- **Adaptación de Zona Horaria**: Conversión automática de horarios
- **Filtrado Dinámico**: Búsqueda en tiempo real
- **Validaciones Completas**: Integridad de datos garantizada

### ✅ Experiencia de Usuario
- **Interfaz Responsiva**: Adaptable a todos los dispositivos
- **Feedback Visual**: Estados de carga y confirmaciones
- **Navegación Intuitiva**: Flujos de usuario optimizados
- **Manejo de Errores**: Mensajes claros y acciones de recuperación

## 📞 Contacto y Soporte

Para consultas técnicas o funcionales sobre esta documentación, contactar al equipo de desarrollo.

**Versión del documento**: 2.0  
**Fecha de actualización**: 19/1/2025  
**Elaborado por**: Equipo de Desarrollo PsiConnect  
**Cambios principales**: Implementación completa de CRUD, base de datos local, panel de administración 