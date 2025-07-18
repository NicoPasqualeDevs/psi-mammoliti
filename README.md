# 🧠 PsiConnect - Plataforma de Agendamiento de Sesiones Psicológicas

## 📋 Descripción General

PsiConnect es una aplicación web moderna desarrollada en React + TypeScript que permite a los pacientes encontrar y agendar sesiones con psicólogos especializados. La plataforma incluye funcionalidades avanzadas como visualización de disponibilidad en calendario semanal, adaptación automática de horarios según zona horaria del usuario, y un sistema completo de filtrado.

## 🎯 Objetivos del Proyecto

- **Facilitar la conexión** entre pacientes y psicólogos especializados
- **Simplificar el proceso de agendamiento** con una interfaz intuitiva
- **Adaptar automáticamente los horarios** según la ubicación del usuario
- **Proporcionar información detallada** sobre especialidades y disponibilidad
- **Ofrecer una experiencia visual atractiva** y profesional

## ⚡ Funcionalidades Principales

### 🔍 Búsqueda y Filtrado de Psicólogos
- **Filtro por especialidad**: Ansiedad, Depresión, Terapia Familiar, Psicología Infantil, etc.
- **Filtro por precio máximo**: Slider interactivo de $50 a $150
- **Filtro por disponibilidad**: Selección por fecha específica
- **Visualización de resultados en tiempo real**

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
- **Bundler**: Create React App (react-scripts 5.0.1)
- **Estilos**: CSS Variables + CSS Grid/Flexbox
- **Linting**: ESLint 8.42.0 + plugins para TypeScript y React
- **Control de versiones**: Git + GitHub

### Estructura del Proyecto
```
src/
├── components/           # Componentes React reutilizables
│   ├── CalendarioDisponibilidad.tsx    # Calendario semanal
│   ├── FiltrosBusqueda.tsx             # Panel de filtros
│   ├── ModalAgendamiento.tsx           # Modal de agendamiento
│   ├── PsicologoCard.tsx               # Tarjeta de psicólogo
│   └── SesionesAgendadas.tsx           # Lista de sesiones
├── data/                 # Datos mock y configuración
│   └── psicologos.ts                   # Lista de psicólogos
├── types/               # Definiciones TypeScript
│   └── index.ts                        # Interfaces y tipos
├── utils/               # Utilidades y helpers
│   └── timezone.ts                     # Funciones de zona horaria
├── App.tsx              # Componente principal
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
  disponibilidad: HorarioDisponible[];
}
```

#### Sesion
```typescript
interface Sesion {
  id: string;
  psicologoId: string;
  fecha: string;
  hora: string;
  paciente: {
    nombre: string;
    email: string;
    telefono: string;
  };
  especialidad: string;
  estado: 'confirmada' | 'pendiente' | 'cancelada';
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
```

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

### 3. Visualización de Citas Agendadas
**Actor**: Paciente
**Flujo**:
1. Click en "Mis Sesiones" en la navegación
2. Visualiza lista completa de sesiones
3. Revisa detalles (fecha, hora, psicólogo, estado)

### 4. Adaptación de Zona Horaria
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
- **Bundle size**: Minimizado con Create React App

### Escalabilidad
- **Arquitectura modular**: Componentes reutilizables
- **Tipado fuerte**: TypeScript previene errores en tiempo de desarrollo
- **Separación de responsabilidades**: Lógica de negocio separada de la presentación

### Mantenibilidad
- **Código limpio**: Siguiendo principios SOLID
- **Documentación**: Comentarios claros y README detallado
- **Linting**: Estándares de código consistentes

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
- **Sistema de autenticación**: Login/registro de usuarios
- **Pasarela de pagos**: Integración con Stripe/PayPal
- **Notificaciones**: Email y SMS de recordatorios
- **Video llamadas**: Integración para sesiones online
- **Calificaciones**: Sistema de reviews y comentarios
- **Chat en tiempo real**: Comunicación pre-sesión
- **API REST**: Backend para persistencia de datos

### Mejoras Técnicas
- **Tests unitarios**: Cobertura completa con Jest
- **Tests E2E**: Cypress para testing de flujos completos
- **PWA**: Aplicación web progresiva
- **Optimización SEO**: Server-side rendering con Next.js
- **Monitoreo**: Analytics y tracking de errores

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

## 📞 Contacto y Soporte

Para consultas técnicas o funcionales sobre esta documentación, contactar al equipo de desarrollo.

**Versión del documento**: 1.0  
**Fecha de actualización**: 18/7/2025  
**Elaborado por**: Equipo de Desarrollo PsiConnect 