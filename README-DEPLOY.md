# 🚀 PsiConnect - Arquitectura Multi-Usuario

## 📋 Descripción de la Nueva Implementación

PsiConnect ahora incluye una **base de datos centralizada** que permite que múltiples usuarios compartan datos en tiempo real. La aplicación se ha transformado de un sistema local con IndexedDB a una **arquitectura cliente-servidor completa**.

## 🏗️ Nueva Arquitectura

### Stack Tecnológico Actualizado
- **Frontend**: React 18.2.0 + TypeScript
- **Backend**: Node.js + Express.js  
- **Base de Datos**: SQLite (centralizada)
- **API**: REST API para comunicación frontend-backend
- **Despliegue**: PM2 + nginx como proxy inverso

### Estructura del Proyecto
```
psi-mammoliti/
├── backend/                    # Servidor backend
│   ├── server.js              # Servidor Express con API REST
│   ├── migrate.js             # Script de migración de datos
│   └── database.sqlite        # Base de datos SQLite (creada automáticamente)
├── src/                       # Frontend React
│   ├── services/
│   │   └── apiService.ts      # Cliente API para comunicación con backend
│   ├── hooks/
│   │   └── useDatabase.ts     # Hook actualizado para usar API
│   └── components/            # Componentes React actualizados
├── deploy/                    # Scripts de despliegue
│   └── deploy.sh             # Script actualizado para backend + frontend
└── package.json              # Dependencias actualizadas
```

## 🔄 Cambios Principales

### ✅ Lo que se ha implementado:

1. **Servidor Backend (backend/server.js)**:
   - API REST con endpoints para psicólogos, sesiones, especialidades
   - Base de datos SQLite con esquema relacional
   - Manejo de CORS para desarrollo y producción
   - Transacciones para operaciones complejas

2. **Cliente API (src/services/apiService.ts)**:
   - Servicio para comunicación con el backend
   - Manejo de errores y estados de carga
   - Compatibilidad con desarrollo y producción

3. **Hook useDatabase actualizado**:
   - Reemplaza IndexedDB con llamadas a la API
   - Mantiene la misma interfaz para compatibilidad
   - Gestión de estado reactivo con los datos del servidor

4. **Despliegue mejorado**:
   - PM2 configurado para backend y frontend por separado
   - Migración automática de datos iniciales
   - Scripts de gestión actualizados
   - Verificación de salud de ambos servicios

### 🗄️ Base de Datos SQLite

**Tablas implementadas:**
- `psicologos` - Información básica de psicólogos
- `especialidades` - Catálogo de especialidades únicas
- `psicologo_especialidades` - Relación muchos a muchos
- `horarios` - Disponibilidad de psicólogos
- `sesiones` - Sesiones agendadas por pacientes

**Características:**
- ✅ **Multi-usuario**: Todos los usuarios ven los mismos datos
- ✅ **Persistencia**: Los datos sobreviven reinicios del servidor
- ✅ **Transacciones**: Operaciones CRUD seguras
- ✅ **Relacional**: Estructura normalizada para escalabilidad

## 🚀 Instalación y Desarrollo

### Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en modo desarrollo (backend + frontend)
npm run dev

# 3. O ejecutar por separado:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm start
```

**URLs de desarrollo:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API: http://localhost:3001/api

### Producción

```bash
# Despliegue automático en servidor Debian
sudo ./deploy/deploy.sh

# O usando el instalador
curl -sSL <URL_SCRIPT> | sudo bash -s <REPO_URL>
```

## 🛠️ Gestión de la Aplicación

### Comandos de PM2 Actualizados

```bash
# Gestión completa
psi-mammoliti-manage start             # Iniciar todo
psi-mammoliti-manage stop              # Detener todo
psi-mammoliti-manage restart           # Reiniciar todo

# Gestión individual
psi-mammoliti-manage restart-backend   # Solo backend
psi-mammoliti-manage restart-frontend  # Solo frontend

# Logs separados
psi-mammoliti-manage logs-backend      # Logs del servidor
psi-mammoliti-manage logs-frontend     # Logs del cliente

# Operaciones de datos
psi-mammoliti-manage migrate           # Migrar datos iniciales
```

### Puertos y Servicios

| Servicio | Puerto | Propósito |
|----------|--------|-----------|
| Frontend | 3000 | Interfaz React |
| Backend | 3001 | API REST + Base de datos |
| nginx | 80 | Proxy inverso público |

## 🔍 API Endpoints

### Psicólogos
- `GET /api/psicologos` - Listar todos los psicólogos
- `GET /api/psicologos/:id` - Obtener psicólogo específico
- `POST /api/psicologos` - Crear nuevo psicólogo
- `PUT /api/psicologos/:id` - Actualizar psicólogo
- `DELETE /api/psicologos/:id` - Eliminar psicólogo

### Sesiones
- `GET /api/sesiones` - Listar todas las sesiones
- `POST /api/sesiones` - Crear nueva sesión

### Utilidades
- `GET /api/especialidades` - Listar especialidades únicas
- `GET /api/stats` - Estadísticas del sistema
- `POST /api/reset` - Limpiar base de datos

## 🎯 Beneficios de la Nueva Arquitectura

### ✅ Multi-Usuario Real
- **Antes**: Cada usuario tenía su propia base de datos local
- **Ahora**: Todos los usuarios comparten la misma base de datos centralizada

### ✅ Escalabilidad
- **Antes**: Limitado al navegador individual
- **Ahora**: Puede manejar múltiples usuarios concurrentes

### ✅ Persistencia de Datos
- **Antes**: Datos perdidos si se limpia el navegador
- **Ahora**: Datos persistentes en el servidor

### ✅ Gestión Centralizada
- **Antes**: No había forma de administrar datos globalmente
- **Ahora**: Panel de administración afecta a todos los usuarios

### ✅ Backup y Recuperación
- **Antes**: Sin opciones de backup
- **Ahora**: Base de datos SQLite fácil de respaldar

## 🔧 Troubleshooting

### Backend no responde
```bash
# Verificar logs
psi-mammoliti-manage logs-backend

# Reiniciar solo backend
psi-mammoliti-manage restart-backend

# Verificar base de datos
ls -la /var/www/psi-mammoliti/backend/database.sqlite
```

### Frontend no conecta con Backend
```bash
# Verificar configuración de proxy en desarrollo
cat package.json | grep proxy

# En producción, verificar nginx
nginx -t
systemctl status nginx
```

### Base de datos corrupta
```bash
# Limpiar y recrear base de datos
psi-mammoliti-manage migrate

# O manualmente
rm /var/www/psi-mammoliti/backend/database.sqlite
node /var/www/psi-mammoliti/backend/migrate.js
```

## 🚀 Próximos Pasos

Esta implementación proporciona una base sólida para futuras mejoras:

1. **Autenticación de usuarios**
2. **Roles y permisos**
3. **Notificaciones en tiempo real**
4. **Backup automático**
5. **Migración a PostgreSQL**
6. **API de terceros (calendarios, pagos)**

## 📞 Soporte

Para problemas específicos:
1. Verificar logs: `psi-mammoliti-manage logs`
2. Revisar estado: `psi-mammoliti-manage status`
3. Ejecutar diagnóstico: `psi-mammoliti-manage diagnose` 