# 🧠 Psi Connect - Configuración Backend Centralizado

Esta aplicación ahora utiliza una **base de datos centralizada SQLite** en lugar de IndexedDB local, lo que significa que todos los usuarios ven los mismos psicólogos.

## 🚀 Configuración Rápida

### 1. Instalación Completa
```bash
npm run setup
```

Este comando:
- Instala dependencias del frontend
- Instala dependencias del backend
- Convierte datos de TypeScript a JSON
- Ejecuta migraciones de base de datos

### 2. Desarrollo (Frontend + Backend)
```bash
npm run dev
```

Este comando ejecuta simultáneamente:
- Backend en puerto `3001`
- Frontend en puerto `3000`

## 🔧 Comandos Individuales

### Frontend
```bash
npm start                    # Ejecutar solo frontend
npm run build               # Construir para producción
```

### Backend
```bash
npm run backend:start       # Ejecutar backend en producción
npm run backend:dev         # Ejecutar backend en desarrollo
npm run backend:migrate     # Solo ejecutar migraciones
npm run convert-data        # Solo convertir datos TS a JSON
```

## 📁 Estructura de Base de Datos

```
backend/
├── database.sqlite         # Base de datos SQLite centralizada
├── server.js              # Servidor Express
├── migrate.js             # Script de migración
└── package.json           # Dependencias del backend
```

### Tablas Creadas:
- `psicologos` - Información de psicólogos
- `especialidades` - Lista de especialidades
- `psicologo_especialidades` - Relación muchos a muchos
- `horarios` - Disponibilidad de horarios
- `sesiones` - Sesiones agendadas

## 🌐 APIs Disponibles

### Psicólogos
- `GET /api/psicologos` - Obtener todos los psicólogos
- `GET /api/psicologos/:id` - Obtener psicólogo por ID
- `POST /api/psicologos` - Crear nuevo psicólogo
- `PUT /api/psicologos/:id` - Actualizar psicólogo
- `DELETE /api/psicologos/:id` - Eliminar psicólogo

### Sesiones
- `GET /api/sesiones` - Obtener todas las sesiones
- `POST /api/sesiones` - Crear nueva sesión

### Utilidades
- `GET /api/especialidades` - Obtener especialidades únicas
- `GET /api/stats` - Obtener estadísticas
- `POST /api/reset` - Limpiar base de datos

## 🔄 Migración de Datos

Los datos se toman automáticamente desde `src/data/psicologos.ts` y se convierten a JSON para el backend.

### Flujo de Datos:
1. **psicologos.ts** (TypeScript) → Datos fuente
2. **convert-psicologos-data.js** → Conversión a JSON
3. **psicologos-data.json** → Datos para migración
4. **migrate.js** → Poblar base de datos SQLite

## 🏗️ Arquitectura

### Antes (Local por Usuario)
```
Frontend → IndexedDB (local) → Datos únicos por usuario ❌
```

### Ahora (Centralizada)
```
Frontend → API Backend → SQLite (central) → Datos compartidos ✅
```

## 🚀 Despliegue

Para producción, asegúrate de:

1. **Instalar dependencias del backend:**
   ```bash
   cd backend && npm install
   ```

2. **Ejecutar migraciones:**
   ```bash
   npm run backend:migrate
   ```

3. **Construir frontend:**
   ```bash
   npm run build
   ```

4. **Iniciar backend:**
   ```bash
   npm run backend:start
   ```

## 🔍 Solución de Problemas

### Error de Conexión
Si aparece "Error al conectar con el servidor":
1. Verifica que el backend esté ejecutándose en puerto 3001
2. Ejecuta `npm run backend:dev` en terminal separada
3. O usa `npm run dev` para ejecutar ambos

### Base de Datos Vacía
Si no aparecen psicólogos:
1. Ejecuta `npm run backend:migrate`
2. Verifica que existe `backend/database.sqlite`
3. Usa el panel de administración para agregar psicólogos

### Panel de Administración
Accede a `/admin` para:
- Ver todos los psicólogos registrados
- Agregar nuevos psicólogos
- Editar psicólogos existentes
- Eliminar psicólogos
- Limpiar base de datos

## 📋 Variables de Entorno

El backend utiliza:
- `PORT` - Puerto del servidor (default: 3001)
- `NODE_ENV` - Entorno (development/production)

## 🛠️ Tecnologías

### Frontend
- React + TypeScript
- React Router
- CSS3 con animaciones

### Backend
- Node.js + Express
- SQLite3
- CORS habilitado

## 🔒 Seguridad

- CORS configurado para desarrollo
- Validación de datos en backend
- Transacciones SQL para integridad
- Manejo de errores robusto 