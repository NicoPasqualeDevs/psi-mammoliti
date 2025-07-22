#!/bin/bash

# Script de despliegue para psi-mammoliti en VM Debian
# Configuración de nginx como proxy inverso para puerto 80

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variables de configuración
APP_NAME="psi-mammoliti"
APP_DIR="/var/www/$APP_NAME"
SERVICE_PORT="3000"
DOMAIN_NAME="${DOMAIN_NAME:-localhost}"

echo -e "${GREEN}🚀 Iniciando despliegue de $APP_NAME${NC}"

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar que se ejecuta como root
if [[ $EUID -ne 0 ]]; then
   error "Este script debe ejecutarse como root (sudo)"
fi

log "Actualizando sistema..."
apt-get update -y
apt-get upgrade -y

log "Instalando dependencias del sistema..."
apt-get install -y \
    curl \
    git \
    nginx \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    unzip

# Instalar Node.js 20.x
log "Instalando Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verificar instalaciones
node_version=$(node --version)
npm_version=$(npm --version)
log "Node.js instalado: $node_version (requerido: >=20.0.0 para react-router-dom v7)"
log "npm instalado: $npm_version"

# Instalar PM2 globalmente
log "Instalando PM2..."
npm install -g pm2

# Crear directorio de aplicación
log "Creando directorio de aplicación..."
mkdir -p "$APP_DIR"
chown -R www-data:www-data "$APP_DIR"

# Copiar archivos de aplicación
log "Copiando archivos de aplicación..."
if [ -d "$(pwd)/src" ]; then
    cp -r "$(pwd)"/* "$APP_DIR/"
else
    error "No se encontraron los archivos de la aplicación. Ejecutar desde el directorio raíz del proyecto."
fi

cd "$APP_DIR"

# Instalar dependencias de Node.js
log "Instalando dependencias npm..."
# Limpiar cache y package-lock si hay conflictos
if [ -f "package-lock.json" ]; then
    log "Limpiando package-lock.json para evitar conflictos de versiones..."
    rm package-lock.json
fi
npm install

# Migrar datos iniciales al backend
log "Ejecutando migración de datos..."
if [ -f "backend/migrate.js" ]; then
    node backend/migrate.js
else
    warning "Script de migración no encontrado, saltando..."
fi

# Construir aplicación para producción
log "Construyendo aplicación..."
npm run build

# Crear archivo de configuración PM2
log "Configurando PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: '$APP_NAME-backend',
      script: 'backend/server.js',
      cwd: '$APP_DIR',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: '3001'
      },
      error_file: '/var/log/$APP_NAME/backend-error.log',
      out_file: '/var/log/$APP_NAME/backend-out.log',
      log_file: '/var/log/$APP_NAME/backend-combined.log',
      time: true
    },
    {
      name: '$APP_NAME-frontend',
      script: 'npx',
      args: 'serve -s build -l $SERVICE_PORT',
      cwd: '$APP_DIR',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: '$SERVICE_PORT'
      },
      error_file: '/var/log/$APP_NAME/frontend-error.log',
      out_file: '/var/log/$APP_NAME/frontend-out.log',
      log_file: '/var/log/$APP_NAME/frontend-combined.log',
      time: true
    }
  ]
};
EOF

# Instalar serve globalmente
log "Instalando serve..."
npm install -g serve

# Crear directorio de logs
mkdir -p "/var/log/$APP_NAME"
chown -R www-data:www-data "/var/log/$APP_NAME"

# Configurar nginx
log "Configurando nginx..."
if [ -f "$(pwd)/deploy/nginx.conf.template" ]; then
    # Usar template si está disponible
    cp "$(pwd)/deploy/nginx.conf.template" "/etc/nginx/sites-available/$APP_NAME"
    
    # Reemplazar variables en el template
    sed -i "s|__DOMAIN_NAME__|$DOMAIN_NAME|g" "/etc/nginx/sites-available/$APP_NAME"
    sed -i "s|__APP_NAME__|$APP_NAME|g" "/etc/nginx/sites-available/$APP_NAME"
    sed -i "s|__SERVICE_PORT__|$SERVICE_PORT|g" "/etc/nginx/sites-available/$APP_NAME"
    sed -i "s|__APP_DIR__|$APP_DIR|g" "/etc/nginx/sites-available/$APP_NAME"
else
    # Configuración básica si no hay template
    cat > "/etc/nginx/sites-available/$APP_NAME" << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    # Logs
    access_log /var/log/nginx/${APP_NAME}_access.log;
    error_log /var/log/nginx/${APP_NAME}_error.log;

    # Configuración de proxy
    location / {
        proxy_pass http://localhost:$SERVICE_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Configuración de seguridad básica
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/javascript application/javascript;
}
EOF
fi

# Habilitar sitio en nginx
ln -sf "/etc/nginx/sites-available/$APP_NAME" "/etc/nginx/sites-enabled/"

# Deshabilitar sitio por defecto
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    rm "/etc/nginx/sites-enabled/default"
fi

# Verificar configuración de nginx
log "Verificando configuración de nginx..."
nginx -t || error "Error en la configuración de nginx"

# Reiniciar nginx
log "Reiniciando nginx..."
systemctl restart nginx
systemctl enable nginx

# Configurar firewall básico (opcional)
log "Configurando firewall..."
if command -v ufw &> /dev/null; then
    log "Configurando ufw..."
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw --force enable
    log "✅ Firewall configurado con ufw"
else
    warning "ufw no está disponible, omitiendo configuración de firewall"
    log "💡 Considera instalar ufw: apt-get install ufw"
fi

# Verificar que el build se creó correctamente
log "Verificando build de React..."
if [ ! -d "$APP_DIR/build" ]; then
    error "El directorio build no existe. La construcción falló."
fi

if [ ! -f "$APP_DIR/build/index.html" ]; then
    error "El archivo index.html no existe en build. La construcción falló."
fi

log "Build verificado correctamente"

# Iniciar aplicación con PM2
log "Iniciando aplicación con PM2..."
cd "$APP_DIR"
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Verificar que las aplicaciones iniciaron correctamente
sleep 5
backend_online=$(pm2 list | grep "$APP_NAME-backend" | grep -c "online")
frontend_online=$(pm2 list | grep "$APP_NAME-frontend" | grep -c "online")

if [ "$backend_online" -eq 0 ]; then
    warning "El backend PM2 no está online. Verificando logs..."
    pm2 logs "$APP_NAME-backend" --lines 10
    
    # Intentar reiniciar
    log "Intentando reiniciar backend..."
    pm2 restart "$APP_NAME-backend"
    sleep 2
fi

if [ "$frontend_online" -eq 0 ]; then
    warning "El frontend PM2 no está online. Verificando logs..."
    pm2 logs "$APP_NAME-frontend" --lines 10
    
    # Intentar reiniciar
    log "Intentando reiniciar frontend..."
    pm2 restart "$APP_NAME-frontend"
    sleep 2
fi

# Configurar PM2 para iniciar automáticamente
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root

log "Verificando estado de servicios..."
systemctl status nginx --no-pager
pm2 status

# Test final de conectividad
log "Realizando test final de conectividad..."
sleep 5

# Test puerto 3001 (backend)
if curl -s -m 10 "http://localhost:3001/api/stats" > /dev/null; then
    log "✅ Backend responde en puerto 3001"
else
    warning "❌ Backend no responde en puerto 3001"
    log "Ejecutando diagnóstico del backend..."
    pm2 logs "$APP_NAME-backend" --lines 5
fi

# Test puerto 3000 (frontend)
if curl -s -m 10 "http://localhost:$SERVICE_PORT" > /dev/null; then
    log "✅ Frontend responde en puerto $SERVICE_PORT"
else
    warning "❌ Frontend no responde en puerto $SERVICE_PORT"
    log "Ejecutando diagnóstico del frontend..."
    pm2 logs "$APP_NAME-frontend" --lines 5
fi

# Test puerto 80 (nginx)
if curl -s -m 10 "http://localhost" > /dev/null; then
    log "✅ nginx responde correctamente"
else
    warning "❌ nginx no responde"
fi

# Crear script de gestión
log "Creando scripts de gestión..."
cat > "/usr/local/bin/$APP_NAME-manage" << 'EOF'
#!/bin/bash

APP_NAME="psi-mammoliti"
APP_DIR="/var/www/$APP_NAME"

case "$1" in
    start)
        echo "Iniciando $APP_NAME..."
        cd "$APP_DIR" && pm2 start ecosystem.config.js
        ;;
    stop)
        echo "Deteniendo $APP_NAME..."
        pm2 stop "$APP_NAME-backend" "$APP_NAME-frontend"
        ;;
    restart)
        echo "Reiniciando $APP_NAME..."
        pm2 restart "$APP_NAME-backend" "$APP_NAME-frontend"
        ;;
    restart-backend)
        echo "Reiniciando backend..."
        pm2 restart "$APP_NAME-backend"
        ;;
    restart-frontend)
        echo "Reiniciando frontend..."
        pm2 restart "$APP_NAME-frontend"
        ;;
    status)
        pm2 status
        ;;
    logs)
        echo "Logs del backend:"
        pm2 logs "$APP_NAME-backend" --lines 25
        echo ""
        echo "Logs del frontend:"
        pm2 logs "$APP_NAME-frontend" --lines 25
        ;;
    logs-backend)
        pm2 logs "$APP_NAME-backend" --lines 50
        ;;
    logs-frontend)
        pm2 logs "$APP_NAME-frontend" --lines 50
        ;;
    diagnose)
        echo "Ejecutando diagnóstico completo..."
        if [ -f "$APP_DIR/deploy/diagnose-react.sh" ]; then
            chmod +x "$APP_DIR/deploy/diagnose-react.sh"
            "$APP_DIR/deploy/diagnose-react.sh"
        else
            echo "Script de diagnóstico no encontrado"
        fi
        ;;
    fix)
        echo "Intentando reparar $APP_NAME..."
        cd "$APP_DIR"
        echo "1. Reconstruyendo aplicación..."
        npm run build
        echo "2. Reiniciando backend..."
        pm2 restart "$APP_NAME-backend"
        echo "3. Reiniciando frontend..."
        pm2 restart "$APP_NAME-frontend"
        echo "4. Verificando estado..."
        sleep 3
        pm2 status
        ;;
    update)
        echo "Actualizando $APP_NAME..."
        cd "$APP_DIR"
        git pull
        npm install
        echo "Ejecutando migración de datos..."
        if [ -f "backend/migrate.js" ]; then
            node backend/migrate.js
        fi
        npm run build
        pm2 restart "$APP_NAME-backend" "$APP_NAME-frontend"
        ;;
    migrate)
        echo "Ejecutando migración de datos..."
        cd "$APP_DIR"
        if [ -f "backend/migrate.js" ]; then
            node backend/migrate.js
        else
            echo "Script de migración no encontrado"
        fi
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|restart-backend|restart-frontend|status|logs|logs-backend|logs-frontend|diagnose|fix|update|migrate}"
        echo ""
        echo "Comandos disponibles:"
        echo "  start            - Iniciar aplicación completa"
        echo "  stop             - Detener aplicación completa"
        echo "  restart          - Reiniciar aplicación completa"
        echo "  restart-backend  - Reiniciar solo backend"
        echo "  restart-frontend - Reiniciar solo frontend"
        echo "  status           - Ver estado de PM2"
        echo "  logs             - Ver logs combinados"
        echo "  logs-backend     - Ver logs del backend"
        echo "  logs-frontend    - Ver logs del frontend"
        echo "  diagnose         - Ejecutar diagnóstico completo"
        echo "  fix              - Intentar reparar problemas comunes"
        echo "  update           - Actualizar desde git"
        echo "  migrate          - Ejecutar migración de datos"
        exit 1
        ;;
esac
EOF

chmod +x "/usr/local/bin/$APP_NAME-manage"

# Mostrar información final
echo ""
echo -e "${GREEN}✅ ¡Despliegue completado con éxito!${NC}"
echo ""
echo -e "${YELLOW}📋 Información del despliegue:${NC}"
echo -e "   🌐 URL: http://$DOMAIN_NAME"
echo -e "   📁 Directorio: $APP_DIR"
echo -e "   🔧 Frontend: puerto $SERVICE_PORT"
echo -e "   🔧 Backend: puerto 3001"
echo -e "   📊 Logs: /var/log/$APP_NAME/"
echo -e "   🗄️ Base de datos: SQLite en $APP_DIR/backend/database.sqlite"
echo -e "   ⚡ Node.js: $(node --version)"
echo ""
echo -e "${YELLOW}🛠️ Comandos útiles:${NC}"
echo -e "   $APP_NAME-manage start             # Iniciar aplicación completa"
echo -e "   $APP_NAME-manage stop              # Detener aplicación"
echo -e "   $APP_NAME-manage restart           # Reiniciar aplicación completa"
echo -e "   $APP_NAME-manage restart-backend   # Reiniciar solo backend"
echo -e "   $APP_NAME-manage restart-frontend  # Reiniciar solo frontend"
echo -e "   $APP_NAME-manage status            # Ver estado"
echo -e "   $APP_NAME-manage logs              # Ver logs combinados"
echo -e "   $APP_NAME-manage logs-backend      # Ver logs del backend"
echo -e "   $APP_NAME-manage logs-frontend     # Ver logs del frontend"
echo -e "   $APP_NAME-manage diagnose          # Diagnosticar problemas"
echo -e "   $APP_NAME-manage fix               # Reparar problemas comunes"
echo -e "   $APP_NAME-manage update            # Actualizar aplicación"
echo -e "   $APP_NAME-manage migrate           # Migrar datos"
echo ""
echo -e "   systemctl status nginx     # Estado de nginx"
echo -e "   pm2 monit                  # Monitor PM2"
echo ""
echo -e "${GREEN}🎉 La aplicación debería estar disponible en: http://$DOMAIN_NAME${NC}" 