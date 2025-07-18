# 🧠 PsiConnect - Plataforma de Agendamiento de Sesiones Psicológicas

## Descripción

PsiConnect es una aplicación web moderna que permite a los usuarios encontrar psicólogos especializados, filtrar por temáticas de consulta, ver horarios disponibles y agendar sesiones de manera simulada.

## Características

- **Ver psicólogos disponibles**: Explora una lista completa de profesionales
- **Filtros avanzados**: Filtra por especialidad, precio máximo y disponibilidad
- **Horarios en tiempo real**: Ve los horarios disponibles de cada psicólogo
- **Agendamiento simple**: Agenda sesiones con un formulario intuitivo
- **Gestión de sesiones**: Ve todas tus sesiones agendadas en un panel dedicado
- **Diseño moderno**: Interfaz atractiva y responsive

## Tecnologías Utilizadas

- **React 18** con TypeScript
- **CSS3** con diseño responsive
- **Datos simulados** para demostración

## Instalación y Ejecución

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn

### Pasos de instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar la aplicación:**
   ```bash
   npm start
   ```

3. **Abrir en el navegador:**
   La aplicación se abrirá automáticamente en `http://localhost:3000`

## Estructura del Proyecto

```
src/
├── components/           # Componentes React reutilizables
│   ├── PsicologoCard.tsx        # Tarjeta de psicólogo
│   ├── FiltrosBusqueda.tsx      # Filtros de búsqueda
│   ├── ModalAgendamiento.tsx    # Modal para agendar
│   └── SesionesAgendadas.tsx    # Lista de sesiones
├── data/                # Datos simulados
│   └── psicologos.ts           # Base de datos de psicólogos
├── types/               # Definiciones de TypeScript
│   └── index.ts                # Interfaces y tipos
├── App.tsx              # Componente principal
├── App.css              # Estilos principales
└── index.tsx            # Punto de entrada
```

## Funcionalidades Principales

### 1. Búsqueda y Filtrado
- Filtro por especialidad (Ansiedad, Depresión, Terapia Familiar, etc.)
- Filtro por precio máximo (deslizador)
- Filtro por disponibilidad por fecha

### 2. Información del Psicólogo
- Foto, nombre y calificación
- Años de experiencia
- Especialidades
- Descripción profesional
- Precio por sesión
- Próxima disponibilidad

### 3. Agendamiento de Sesiones
- Selección de fecha y hora
- Elección de especialidad
- Formulario de datos personales
- Resumen de la sesión
- Confirmación inmediata

### 4. Gestión de Sesiones
- Lista de todas las sesiones agendadas
- Estado de cada sesión (confirmada, pendiente, cancelada)
- Detalles completos de cada cita

## Datos de Ejemplo

La aplicación incluye 5 psicólogos ficticios con diferentes especialidades:

1. **Ana García Ruiz** - Ansiedad, Depresión, TCC
2. **Carlos Mendoza López** - Terapia Familiar y de Pareja
3. **María Fernández Silva** - Psicología Infantil, TDAH
4. **Roberto Jiménez Castro** - Estrés Laboral, Burnout
5. **Lucía Morales Vega** - Trauma, EMDR

## Responsive Design

La aplicación está optimizada para:
- 💻 **Desktop**: Diseño de dos columnas con sidebar
- 📱 **Mobile**: Diseño apilado con navegación adaptada
- 📊 **Tablet**: Layout intermedio optimizado

## Scripts Disponibles

- `npm start`: Ejecuta la aplicación en modo desarrollo
- `npm build`: Construye la aplicación para producción
- `npm test`: Ejecuta los tests (si están configurados)

## Próximas Mejoras

- [ ] Integración con backend real
- [ ] Sistema de notificaciones
- [ ] Pagos en línea
- [ ] Chat en tiempo real
- [ ] Calificaciones y reseñas
- [ ] Recordatorios por email/SMS 